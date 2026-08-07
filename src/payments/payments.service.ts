import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentRepository } from './payment.repository';
import { Payment } from './entities/payment.entity';
import { CreateConsultationCheckoutDto } from './dto/create-checkout.dto';
import { ProspectService } from '../prospect/prospect.service';
import { ConsultationBookingRepository } from '../consultation/consultation.repository';

/**
 * Owns the Stripe relationship.
 *
 * Two rules this file holds to:
 *
 *  1. The client never names a price. The amount comes from a Price object
 *     configured in Stripe and referenced by env — the request only says WHO
 *     is paying, never HOW MUCH.
 *
 *  2. Nothing is marked paid here. This service creates a session and returns
 *     a URL; the transition to `paid` happens only in the webhook, from a
 *     signature-verified Stripe event. A success redirect is a browser
 *     navigation and a browser navigation is not proof of payment — anyone can
 *     open the success URL directly.
 */
/**
 * Names the specific mistake, because "not a Price id" is true but unhelpful
 * and there are only two ways to get this wrong.
 *
 * Both are easy: the Product id sits next to the Price id on the same dashboard
 * page, and the env var reads like it wants a fee.
 */
function explainBadPriceId(value: string): string {
  if (value.startsWith('prod_')) {
    return (
      `That is the PRODUCT id — the Price id sits next to it on the same page. ` +
      `Run \`stripe prices list --product=${value}\` and use the "price_..." id ` +
      `it returns, or create one with ` +
      `\`stripe prices create --product=${value} --unit-amount=<cents> --currency=aud\`.`
    );
  }

  if (/^[\d.,]+$/.test(value.trim())) {
    return (
      `That is an amount. The fee lives in Stripe as a Price object so the ` +
      `client can never name a price — if it could, a consult could be bought ` +
      `for a cent. Create a Product and Price in Stripe and use the id.`
    );
  }

  return (
    `It must look like "price_1AbC...". Create a Product and Price in the ` +
    `Stripe dashboard (or with \`stripe prices create\`) and use the id it returns.`
  );
}

/**
 * Did Stripe definitely refuse, or do we simply not know?
 *
 * The distinction decides whether a payment row can be written off. Stripe's
 * SDK reports its own refusals with a `type` — an invalid request, a bad key —
 * and those mean no session was created. A timeout, a socket reset or an
 * unrecognised error means the request may well have succeeded with the answer
 * lost in transit, and a session that exists is a session someone can pay.
 *
 * `StripeConnectionError` and `StripeAPIError` are explicitly NOT definite:
 * both are raised for failures where Stripe may have processed the request.
 */
function isDefiniteStripeRejection(error: unknown): boolean {
  const type = (error as { type?: unknown })?.type;
  if (typeof type !== 'string') return false;

  return (
    type === 'StripeInvalidRequestError' ||
    type === 'StripeAuthenticationError' ||
    type === 'StripePermissionError' ||
    type === 'StripeCardError' ||
    type === 'StripeRateLimitError'
  );
}

/**
 * Stripe's documented minimum charge, in MINOR units, for the currencies this
 * product plausibly bills in.
 *
 * Advisory only. Stripe can change these and the list is deliberately short, so
 * falling under one is a warning rather than a refusal — but it is worth saying
 * out loud, because a price under the minimum fails at exactly the same moment
 * and with the same customer-facing message as a malformed one.
 */
const MINIMUM_CHARGE_MINOR_UNITS: Record<string, number> = {
  aud: 50,
  cad: 50,
  eur: 50,
  gbp: 30,
  jpy: 50,
  nzd: 50,
  sgd: 50,
  usd: 50,
};

/**
 * The Price's unit amount, in MINOR units, as a plain decimal string.
 *
 * `unit_amount_decimal` is typed as Stripe's branded `Decimal` in SDK v22 but
 * arrives as a plain JSON string from the v1 REST API, so this survives both:
 * `Decimal.toString()` gives normalised plain notation, and a string is already
 * what we want.
 */
function minorUnits(price: Stripe.Price): string | null {
  const decimal = price.unit_amount_decimal;
  return decimal === null || decimal === undefined ? null : String(decimal);
}

/**
 * Can this Price actually be charged for a one-off consultation?
 *
 * Returns the operator-facing explanation, or null if the Price is fine. Every
 * case here is a Price that genuinely exists and has a perfectly valid id — the
 * id-shape check in the constructor waves all of them through.
 */
function explainUnusablePrice(price: Stripe.Price): string | null {
  if (!price.active) {
    return (
      `Price ${price.id} is archived, and Checkout will not accept an archived ` +
      `price. Un-archive it in the dashboard, or point STRIPE_CONSULT_PRICE_ID ` +
      `at a live one.`
    );
  }

  if (price.type !== 'one_time') {
    return (
      `Price ${price.id} is a recurring price. The consultation is charged once, ` +
      `in \`mode: 'payment'\`, which only accepts one-off prices. Create a ` +
      `one-time Price for the consult fee.`
    );
  }

  const decimal = minorUnits(price);
  if (decimal === null) {
    return (
      `Price ${price.id} has no flat unit amount — it is tiered or metered, ` +
      `which Checkout cannot charge in payment mode.`
    );
  }

  // The failure this whole check exists for. `unit_amount_decimal` is in MINOR
  // units and Stripe lets you create a Price with fractions of one, but
  // Checkout in payment mode rejects anything finer than a whole minor unit.
  // "0.1" is a tenth of a cent and reads exactly like "10 cents", which is the
  // trap: it looks right in the dashboard and fails only at checkout.
  if (!/^\d+$/.test(decimal)) {
    const code = price.currency.toUpperCase();
    const product =
      typeof price.product === 'string' ? price.product : price.product.id;
    return (
      `Price ${price.id} is ${decimal} ${code} cents — a fraction of a cent. ` +
      `Checkout cannot charge sub-cent amounts in payment mode, so consultation ` +
      `checkout WILL fail. A Stripe Price is immutable, so this cannot be edited: ` +
      `create a replacement with a whole-cent amount ` +
      `(\`stripe prices create --product=${product} --unit-amount=<whole cents> ` +
      `--currency=${price.currency}\`), point STRIPE_CONSULT_PRICE_ID at it, and ` +
      `archive this one.`
    );
  }

  return null;
}

/**
 * How long an unpaid checkout session is offered again instead of replaced.
 *
 * Stripe expires sessions after 24 hours by default. Staying inside that means
 * a reused URL is one Stripe still recognises; past it, the reuse check would
 * just be a round trip that always fails.
 */
const SESSION_REUSE_MS = 20 * 60 * 60 * 1000;

/**
 * How long before an unpaid session is swept up.
 *
 * Comfortably past Stripe's own expiry, so the sweep is tidying up settled
 * cases rather than racing a visitor who is still deciding.
 */
export const STALE_SESSION_MS = 26 * 60 * 60 * 1000;

@Injectable()
export class PaymentsService implements OnModuleInit {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly stripe: Stripe | null;

  constructor(
    private readonly configService: ConfigService,
    private readonly paymentRepository: PaymentRepository,
    private readonly prospectService: ProspectService,
    private readonly bookingRepository: ConsultationBookingRepository,
  ) {
    const secretKey = this.configService.get<string>(
      'integrations.stripe.secretKey',
    );

    if (!secretKey) {
      // Not fatal at boot — the rest of the API must still run in local dev
      // and in environments that do not take payments. Requests to the
      // checkout endpoint fail loudly instead.
      this.logger.warn(
        'STRIPE_SECRET_KEY is not set — consultation checkout is disabled.',
      );
      this.stripe = null;
    } else {
      // apiVersion deliberately not pinned here: the installed SDK pins its
      // own tested version. Pin it explicitly only when you have a reason to,
      // and then verify the webhook payload shape still matches.
      this.stripe = new Stripe(secretKey);
    }

    // Checked at boot rather than only at checkout. A misconfigured price is
    // invisible until someone tries to pay — which is the worst possible moment
    // to discover it, and the one place nobody is watching the logs.
    const priceId = this.configService.get<string>(
      'integrations.stripe.consultPriceId',
    );
    if (priceId && !priceId.startsWith('price_')) {
      this.logger.error(
        `STRIPE_CONSULT_PRICE_ID is "${priceId}" — that is not a Stripe Price ` +
          `id, so consultation checkout WILL fail. ${explainBadPriceId(priceId)}`,
      );
    } else if (!priceId) {
      this.logger.warn(
        'STRIPE_CONSULT_PRICE_ID is not set — consultation checkout is disabled.',
      );
    }
  }

  /**
   * Asks Stripe whether the configured Price can actually be charged.
   *
   * The constructor can only check that the id LOOKS like a Price id. That
   * catches a Product id or a bare amount pasted into the env var, and misses
   * every way a real, valid-looking Price is still unchargeable: archived,
   * recurring, tiered, or denominated in fractions of a cent. All of those
   * reach the customer identically — a 503 and "please try again shortly",
   * advice that can never work for a fault entirely on our side.
   *
   * Costs one API call per boot, and per cold start on serverless. Never fatal:
   * Stripe being unreachable at boot is not a reason to stop serving the rest
   * of the API, and checkout would surface it anyway.
   */
  async onModuleInit(): Promise<void> {
    const priceId = this.configService.get<string>(
      'integrations.stripe.consultPriceId',
    );

    // Both already reported loudly by the constructor; no second opinion needed.
    if (!this.stripe || !priceId?.startsWith('price_')) return;

    let price: Stripe.Price;
    try {
      price = await this.stripe.prices.retrieve(priceId);
    } catch (error) {
      const message = (error as Error).message;
      if (isDefiniteStripeRejection(error)) {
        // Stripe answered and said no — wrong account, revoked key, deleted
        // price. That is a real misconfiguration, not a blip.
        this.logger.error(
          `STRIPE_CONSULT_PRICE_ID is "${priceId}" but Stripe will not return ` +
            `it: ${message} Consultation checkout WILL fail.`,
        );
      } else {
        this.logger.warn(
          `Could not verify STRIPE_CONSULT_PRICE_ID at boot: ${message}`,
        );
      }
      return;
    }

    const problem = explainUnusablePrice(price);
    if (problem) {
      this.logger.error(problem);
      return;
    }

    const amount = Number(minorUnits(price));
    const code = price.currency.toUpperCase();
    const minimum = MINIMUM_CHARGE_MINOR_UNITS[price.currency];

    if (minimum !== undefined && amount < minimum) {
      this.logger.error(
        `Consultation price ${price.id} is ${amount} ${code} cents, under ` +
          `Stripe's ${minimum}-cent minimum charge for ${code}. Checkout will ` +
          `reject it and consultation checkout WILL fail.`,
      );
      return;
    }

    this.logger.log(
      `Consultation price ${price.id} verified: ${amount} ${code} cents.`,
    );
  }

  /**
   * Creates a hosted Stripe Checkout session for the consultation fee.
   * Returns the URL the browser should be sent to.
   */
  async createConsultationCheckout(
    dto: CreateConsultationCheckoutDto,
  ): Promise<{ checkout_url: string; payment_id: string }> {
    const stripe = this.requireStripe();

    const priceId = this.configService.get<string>(
      'integrations.stripe.consultPriceId',
    );
    if (!priceId) {
      throw new ServiceUnavailableException(
        'The consultation fee has not been configured yet.',
      );
    }

    // Caught here rather than left to Stripe, because Stripe's rejection
    // arrives as a generic session-creation failure and the visitor is told to
    // "try again shortly" — advice that can never work, for a fault entirely on
    // our side. The mistake is an easy one: STRIPE_CONSULT_PRICE_ID looks like
    // it wants a fee, and setting it to an amount (`0.01`) is the obvious
    // reading. It wants the id of a Price object created in Stripe.
    if (!priceId.startsWith('price_')) {
      this.logger.error(
        `STRIPE_CONSULT_PRICE_ID is "${priceId}", which is not a Stripe Price ` +
          `id. ${explainBadPriceId(priceId)}`,
      );
      throw new ServiceUnavailableException(
        'The consultation fee is not set up correctly. Please contact us and ' +
          'quote your reference — we will take payment another way.',
      );
    }

    // Throws 404 if the prospect does not exist — which also stops this
    // endpoint being used to probe for valid prospect ids with a real charge.
    const prospect = await this.prospectService.findById(dto.prospect_id);

    if (await this.paymentRepository.hasPaidFor(prospect.id, 'consultation')) {
      // Charging twice for the same consult is worse than a slightly awkward
      // error, and it is a refund conversation either way.
      throw new BadRequestException(
        'This consultation has already been paid for.',
      );
    }

    const booking = dto.booking_id
      ? await this.bookingRepository.findById(dto.booking_id)
      : await this.bookingRepository.findLatestForProspect(prospect.id);

    if (!booking) {
      // Book-then-pay: there should always be a pending booking by the time
      // someone reaches checkout.
      //
      // The overwhelmingly likely cause is timing, not a skipped funnel. The
      // booking row is written by Calendly's invitee webhook, a server-to-server
      // call that races the visitor's own browser — so someone who books and
      // immediately pays can get here first. The old wording ("choose a
      // consultation time before paying") told exactly that person that the
      // time they had just chosen did not count, which is both wrong and the
      // most alarming possible reading.
      //
      // Logged as a warning because the other cause — a webhook that is not
      // reaching us at all — looks identical from here and is worth noticing
      // in aggregate.
      this.logger.warn(
        `Checkout attempted for prospect ${prospect.human_ref} with no booking. ` +
          `Usually the Calendly invitee webhook has not landed yet; if this is ` +
          `frequent, check the webhook subscription is live.`,
      );
      throw new BadRequestException(
        'We are still registering the time you picked. Give it a few seconds ' +
          'and try again — if it keeps happening, contact us with your reference.',
      );
    }

    const successUrl = this.configService.get<string>(
      'integrations.stripe.successUrl',
    );
    const cancelUrl = this.configService.get<string>(
      'integrations.stripe.cancelUrl',
    );
    if (!successUrl || !cancelUrl) {
      throw new ServiceUnavailableException(
        'Payment return URLs are not configured.',
      );
    }

    // Reuse a session already open for this booking rather than minting
    // another.
    //
    // Every session we create is a live, chargeable link that stays valid until
    // Stripe expires it. Someone who reloads this page, or whose first attempt
    // died between our row being written and Stripe's answer arriving, would
    // otherwise be handed a second one — and both remain payable. Two live
    // links for one consultation is a refund conversation waiting to happen.
    const open = await this.paymentRepository.findOpenSessionForBooking(
      booking.id,
      SESSION_REUSE_MS,
    );
    if (open?.provider_session_id) {
      const reusable = await this.retrieveReusableSession(
        stripe,
        open.provider_session_id,
      );
      if (reusable) {
        this.logger.log(
          `Reusing open checkout session ${open.provider_session_id} for ` +
            `prospect ${prospect.human_ref}`,
        );
        return { checkout_url: reusable, payment_id: open.id };
      }
      // Stripe has expired or completed it. Close our row off so the sweep and
      // the next reuse check both stop considering it.
      await this.paymentRepository.update(open.id, { status: 'expired' });
    }

    // Write the local row FIRST, in `created`. If Stripe succeeds and our
    // response is lost in flight, the webhook still has a row to reconcile
    // against rather than arriving for a payment we have no record of.
    const payment = await this.paymentRepository.create({
      prospect_id: prospect.id,
      booking_id: booking.id,
      purpose: 'consultation',
      status: 'created',
      provider: 'stripe',
      currency: 'aud',
    });

    try {
      const session = await stripe.checkout.sessions.create(
        {
          mode: 'payment',
          line_items: [{ price: priceId, quantity: 1 }],
          customer_email: prospect.email,
          // client_reference_id and metadata are how the webhook gets back to
          // our records. Both are set: metadata is richer, client_reference_id
          // is what shows in the Stripe dashboard search box, which is what an
          // agent will actually use when reconciling by hand.
          client_reference_id: prospect.human_ref,
          metadata: {
            prospect_id: prospect.id,
            human_ref: prospect.human_ref,
            booking_id: booking.id,
            payment_id: payment.id,
            purpose: 'consultation',
          },
          success_url: `${successUrl}${successUrl.includes('?') ? '&' : '?'}ref=${prospect.human_ref}`,
          cancel_url: cancelUrl,
        },
        {
          // Idempotency key: a double-clicked pay button creates one session,
          // not two. Scoped to the payment row so a genuine retry after a
          // failure still gets a fresh session.
          idempotencyKey: `consult-${payment.id}`,
        },
      );

      // Record the session BEFORE checking it is usable. A session with no URL
      // is useless to us and still perfectly payable at Stripe — it is a real
      // object that exists in their system. Throwing without storing the id
      // would leave a row nothing could ever match a payment to.
      await this.paymentRepository.update(payment.id, {
        provider_session_id: session.id,
        amount_cents: session.amount_total ?? null,
        currency: session.currency ?? 'aud',
      });

      if (!session.url) {
        throw new Error(
          `Stripe returned session ${session.id} without a URL — recorded so ` +
            `reconciliation can resolve it.`,
        );
      }

      return { checkout_url: session.url, payment_id: payment.id };
    } catch (error) {
      // Whether this row may be written off depends on WHY the call failed,
      // and the two cases are not close.
      //
      // Stripe rejected the request — bad price, bad key — and no session
      // exists. Marking it failed is correct and keeps it out of the sweep.
      //
      // The call timed out, or the connection dropped, and we do not know. A
      // session may well have been created and be sitting there payable. It
      // used to be marked failed regardless, which took it out of the
      // reconciliation sweep entirely: the visitor could then pay through a
      // session we had already written off, and nothing would ever confirm it.
      // Left in `created`, the sweep asks Stripe what really happened.
      if (isDefiniteStripeRejection(error)) {
        await this.paymentRepository.update(payment.id, { status: 'failed' });
      } else {
        this.logger.warn(
          `Checkout for ${prospect.human_ref} failed without a definite answer ` +
            `from Stripe. Leaving payment ${payment.id} open so reconciliation ` +
            `can check whether a session was created.`,
        );
      }

      this.logger.error(
        `Failed to create Stripe checkout session for prospect ${prospect.human_ref}: ${(error as Error).message}`,
      );
      throw new ServiceUnavailableException(
        'We could not start the payment. Please try again shortly.',
      );
    }
  }

  /**
   * Marks a payment paid. Called ONLY from the verified Stripe webhook.
   *
   * Returns the payment so the caller can run its side effects — flipping the
   * booking, advancing the prospect, alerting the agent. Returns null only when
   * there is nothing to act on at all.
   *
   * ⚠️ It deliberately does NOT return null just because the payment was
   * already marked paid. That was the old behaviour and it hid a real loss:
   * marking paid and confirming the booking are separate writes, so a restart
   * between them left the money taken and the booking pending, and every retry
   * afterwards saw `status = 'paid'`, returned null, and skipped the very work
   * that had not happened. Being paid is a fact about this row; whether the
   * booking was confirmed is a fact about a different one, and only the caller
   * can check the second. The side effects are individually idempotent, so
   * running them again on a genuine replay is harmless.
   */
  async markPaidFromSession(session: {
    id: string;
    payment_intent?: string | null;
    amount_total?: number | null;
    currency?: string | null;
    metadata?: Record<string, string> | null;
  }): Promise<Payment | null> {
    // Two ways to find our row, and the second is not redundant.
    //
    // Normally the session id is on it. But if the create call timed out after
    // Stripe had built the session, we never stored the id — and the row sits
    // in `created`, invisible to a session-id lookup, while the visitor pays
    // through a session that genuinely exists. Falling straight through to the
    // metadata branch below would then create a SECOND payment row for one
    // payment, leaving the original stranded as unpaid forever.
    //
    // `payment_id` is put in the session metadata at creation precisely so this
    // is recoverable.
    const existing =
      (await this.paymentRepository.findBySessionId(session.id)) ??
      (await this.findByMetadataPaymentId(session.metadata?.payment_id));

    if (existing?.status === 'paid') {
      this.logger.log(
        `Stripe session ${session.id} is already paid — re-running the ` +
          `confirmation so anything left unfinished last time completes.`,
      );
      return existing;
    }

    if (existing) {
      // Payment and booking move together. The gap between them is the one
      // state nothing can explain afterwards — money taken, booking pending,
      // no error anywhere — so it is closed rather than monitored.
      return this.paymentRepository.markPaidWithBooking(
        existing.id,
        existing.booking_id ?? null,
        {
          status: 'paid',
          // Backfilled here for the row we found by metadata rather than by
          // session id: without it the row stays unmatchable by session for
          // every future replay, and the reconciliation sweep cannot see it.
          provider_session_id: session.id,
          provider_payment_intent_id: session.payment_intent ?? null,
          amount_cents: session.amount_total ?? existing.amount_cents ?? null,
          currency: session.currency ?? existing.currency,
          paid_at: new Date(),
          provider_metadata: session.metadata ?? undefined,
        },
      );
    }

    // No local row: the session was created outside this service, or our row
    // was lost. Stripe says it was paid, so record it rather than drop it —
    // an orphan payment row is recoverable, a silently ignored payment is not.
    const prospectId = session.metadata?.prospect_id;
    if (!prospectId) {
      this.logger.error(
        `Stripe session ${session.id} completed with no local payment row and ` +
          `no prospect_id in metadata — manual reconciliation required`,
      );
      return null;
    }

    return this.paymentRepository.create({
      prospect_id: prospectId,
      booking_id: session.metadata?.booking_id ?? null,
      purpose: 'consultation',
      status: 'paid',
      provider: 'stripe',
      provider_session_id: session.id,
      provider_payment_intent_id: session.payment_intent ?? null,
      amount_cents: session.amount_total ?? null,
      currency: session.currency ?? 'aud',
      paid_at: new Date(),
      provider_metadata: session.metadata ?? undefined,
    });
  }

  /**
   * Closes off a session that ended without a payment.
   *
   * Refuses to touch a row already marked `paid`. Events can arrive out of
   * order, and an `expired` for a session that settled first would otherwise
   * un-pay a real payment — the one write in this file that could lose money
   * rather than merely fail to record it.
   *
   * Returns null when there is nothing to update, so the caller can say so
   * rather than assuming success.
   */
  async markSessionUnpaid(
    sessionId: string,
    outcome: 'failed' | 'expired',
  ): Promise<Payment | null> {
    const existing = await this.paymentRepository.findBySessionId(sessionId);
    if (!existing) return null;

    if (existing.status === 'paid') {
      this.logger.warn(
        `Ignoring "${outcome}" for session ${sessionId}: the payment is ` +
          `already recorded as paid. Events arrived out of order.`,
      );
      return existing;
    }

    return this.paymentRepository.update(existing.id, { status: outcome });
  }

  /**
   * Asks Stripe what actually happened to one open session.
   *
   * The reconciliation sweep's per-row work. Three outcomes:
   *
   *   recovered — Stripe says it was paid. The webhook never reached us, so
   *               the payment is confirmed here instead. This is the case that
   *               matters: a customer charged for a booking that was never
   *               confirmed.
   *   expired   — Stripe agrees nobody paid. Safe to close off.
   *   open      — still live. Left alone.
   *
   * Confirmation is delegated to the same handler the webhook uses, rather than
   * reimplemented. Two code paths that both confirm bookings would drift, and
   * the one used less often would be the one that drifted.
   */
  async reconcileSession(
    paymentId: string,
    sessionId: string,
  ): Promise<'recovered' | 'expired' | 'open'> {
    const stripe = this.requireStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const isPaid =
      session.payment_status === 'paid' ||
      session.payment_status === 'no_payment_required';

    if (isPaid) {
      this.logger.warn(
        `Session ${sessionId} is paid at Stripe but our payment ${paymentId} ` +
          `was still open — the webhook never arrived. Confirming it now.`,
      );

      // Handed to the confirm callback rather than done here, so that the
      // booking flip, the stage advance and the agent alert all happen exactly
      // as they would have.
      await this.confirmFromReconciliation?.({
        id: session.id,
        payment_intent:
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : (session.payment_intent?.id ?? null),
        amount_total: session.amount_total,
        currency: session.currency,
        metadata: session.metadata,
      });

      return 'recovered';
    }

    if (session.status === 'open') return 'open';

    // Stripe has closed it and no money moved. Marking it expired keeps it out
    // of future sweeps and out of the session-reuse lookup.
    await this.paymentRepository.update(paymentId, { status: 'expired' });
    return 'expired';
  }

  /**
   * How a recovered payment gets confirmed.
   *
   * Injected by WebhooksModule at boot rather than imported, because
   * WebhooksService already depends on PaymentsService — importing it back
   * would make the module graph circular. A callback keeps the dependency
   * one-way and the confirmation logic in exactly one place.
   */
  private confirmFromReconciliation?: (session: {
    id: string;
    payment_intent?: string | null;
    amount_total?: number | null;
    currency?: string | null;
    metadata?: Record<string, string> | null;
  }) => Promise<void>;

  setReconciliationConfirmer(
    confirm: (session: {
      id: string;
      payment_intent?: string | null;
      amount_total?: number | null;
      currency?: string | null;
      metadata?: Record<string, string> | null;
    }) => Promise<void>,
  ): void {
    this.confirmFromReconciliation = confirm;
  }

  /**
   * Looks up the payment row named in a Stripe session's metadata.
   *
   * Tolerant of a missing or unrecognised id: metadata is data we put there
   * ourselves, but the session may predate the field, or have been created by
   * hand in the dashboard. Returning null lets the caller fall through to
   * recording the payment fresh, which is the right outcome — an orphan row is
   * recoverable, a dropped payment is not.
   */
  private async findByMetadataPaymentId(
    paymentId?: string,
  ): Promise<Payment | null> {
    if (!paymentId) return null;

    try {
      return await this.paymentRepository.findById(paymentId);
    } catch {
      this.logger.warn(
        `Stripe session names payment ${paymentId}, which does not exist here.`,
      );
      return null;
    }
  }

  findForProspect(prospectId: string): Promise<Payment[]> {
    return this.paymentRepository.findByProspectId(prospectId);
  }

  /**
   * The URL of an existing session, if it is still usable.
   *
   * Returns null for anything already paid, expired or gone — handing back a
   * dead link looks to the visitor exactly like a broken pay button, which is
   * worse than the duplicate session reuse was meant to avoid.
   *
   * A Stripe outage here returns null too. Falling back to creating a fresh
   * session risks a second live link; refusing to take the payment at all
   * guarantees a lost one. The second is worse, and the duplicate is visible
   * and refundable.
   */
  private async retrieveReusableSession(
    stripe: Stripe,
    sessionId: string,
  ): Promise<string | null> {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.status !== 'open' || !session.url) return null;
      return session.url;
    } catch (error) {
      this.logger.warn(
        `Could not check existing session ${sessionId}, creating a new one: ` +
          `${(error as Error).message}`,
      );
      return null;
    }
  }

  private requireStripe(): Stripe {
    if (!this.stripe) {
      throw new ServiceUnavailableException(
        'Payments are not configured on this environment.',
      );
    }
    return this.stripe;
  }
}
