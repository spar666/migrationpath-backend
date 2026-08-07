/**
 * Why did this payment not confirm the booking?
 *
 * A payment travels through six places, and when a booking stays `pending` the
 * only useful question is which one it stopped at:
 *
 *   Stripe took the money
 *     -> Stripe sent an event of a type we subscribed to
 *       -> the event reached this server and passed signature verification
 *         -> a webhook_events row was claimed
 *           -> a payments row was marked paid
 *             -> the booking was flipped to confirmed
 *
 * Every one of those failures looks identical from the dashboard — "the
 * customer paid and nothing happened" — and they have six different fixes. This
 * asks Stripe and the database in turn and names the first link that is broken.
 *
 *   npm run stripe:doctor -- evt_1ABC...      an event id from the dashboard
 *   npm run stripe:doctor -- cs_test_a1B2...  a checkout session id
 *   npm run stripe:doctor -- pi_3ABC...       a payment intent id
 *   npm run stripe:doctor                     the endpoint config only
 *
 * Add --fix-endpoint to re-enable a disabled endpoint and subscribe it to every
 * event the handler knows about. Stripe disables an endpoint by itself after
 * days of failed deliveries, which outlives the outage that caused it: the
 * tunnel comes back, the server is healthy, and nothing is delivered.
 *
 * Add --replay to push a genuinely-paid session back through the same handler
 * the webhook uses. That path is idempotent, so it is safe on a booking that
 * already confirmed; it exists because the reconciliation sweep only looks at
 * sessions older than 26 hours, and a customer on the phone now cannot wait a
 * day for the safety net to catch up.
 *
 * Read-only unless --fix-endpoint or --replay is passed.
 */
import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
import Stripe from 'stripe';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { WebhooksService } from '../src/webhooks/webhooks.service';

config();

/** The events that can confirm or close a consultation. Keep in sync with stripe-webhook.controller.ts. */
const HANDLED_EVENTS: Stripe.WebhookEndpointUpdateParams.EnabledEvent[] = [
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.async_payment_failed',
  'checkout.session.expired',
];

/** Only the first two move money into a confirmed booking; the others close a row off. */
const CONFIRMING_EVENTS = HANDLED_EVENTS.slice(0, 2);

// --- Output -----------------------------------------------------------------

const problems: string[] = [];

const say = (line = '') => console.log(line);
const heading = (line: string) => say(`\n${line}\n${'-'.repeat(line.length)}`);
const ok = (line: string) => say(`  ok    ${line}`);
const info = (line: string) => say(`        ${line}`);
const bad = (line: string) => {
  say(`  BAD   ${line}`);
  problems.push(line);
};

// --- Entry point ------------------------------------------------------------

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const replay = args.includes('--replay');
  const fixEndpoint = args.includes('--fix-endpoint');
  const id = args.find((arg) => !arg.startsWith('--'));

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    say('STRIPE_SECRET_KEY is not set. Nothing to ask Stripe with.');
    process.exitCode = 1;
    return;
  }
  const stripe = new Stripe(secretKey);

  if (fixEndpoint) await fixEndpoints(stripe);

  const endpoints = await checkEndpoints(stripe);

  if (!id) {
    say(
      '\nPass an event, session or payment-intent id to trace one payment ' +
        'through to its booking.',
    );
    return summarise();
  }

  const session = await resolveSession(stripe, id, endpoints);
  if (!session) return summarise();

  // Raw SQL against a connection of its own, with no entities registered. A
  // diagnostic must report what is in the table, not what the current entity
  // definitions say should be — those two disagreeing is itself a bug this is
  // meant to be able to find.
  const db = new DataSource({
    type: 'postgres',
    url: databaseUrl(),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    logging: false,
  });
  await db.initialize();
  try {
    await checkDatabase(db, session, id);
  } finally {
    await db.destroy();
  }

  if (replay) await replaySession(stripe, session);

  summarise();
}

// --- 0. Put the endpoint back the way the code expects it -------------------

/**
 * Re-enables our endpoint and subscribes it to every event the handler knows.
 *
 * The same two clicks as the dashboard, minus the clicking — and, more to the
 * point, minus the chance of enabling one endpoint and editing the events on
 * another. The event list is derived from HANDLED_EVENTS, so the subscription
 * cannot drift from the switch statement that reads it.
 *
 * Only ever touches endpoints whose URL points at this application, and adds
 * to the event list rather than replacing it: anything else subscribed there
 * was subscribed deliberately by someone, and this is not the place to
 * second-guess that.
 *
 * Re-enabling does not re-deliver what was missed while it was off. Use
 * --replay for those.
 */
async function fixEndpoints(stripe: Stripe): Promise<void> {
  heading('Repairing the endpoint');

  const endpoints = await stripe.webhookEndpoints.list({ limit: 20 });
  const ours = endpoints.data.filter((endpoint) =>
    endpoint.url.includes('/webhooks/stripe'),
  );

  if (ours.length === 0) {
    say('  Nothing to repair — no endpoint points at this application.');
    return;
  }

  for (const endpoint of ours) {
    const merged = [
      ...new Set([...endpoint.enabled_events, ...HANDLED_EVENTS]),
    ] as Stripe.WebhookEndpointUpdateParams.EnabledEvent[];

    const added = merged.length - endpoint.enabled_events.length;
    const wasDisabled = endpoint.status !== 'enabled';

    if (!wasDisabled && added === 0) {
      say(`  ${endpoint.url}\n        already correct — left alone.`);
      continue;
    }

    await stripe.webhookEndpoints.update(endpoint.id, {
      disabled: false,
      // A wildcard subscription already covers everything; rewriting it as an
      // explicit list would narrow it, which is the opposite of a repair.
      ...(endpoint.enabled_events.includes('*')
        ? {}
        : { enabled_events: merged }),
    });

    say(`  ${endpoint.url}`);
    if (wasDisabled) say('        enabled');
    if (added > 0) say(`        added ${added} event subscription(s)`);
  }

  say(
    '\n        Events missed while it was disabled were NOT re-sent. Recover ' +
      'them with --replay.',
  );
}

// --- 1. Is the endpoint subscribed to the right things? ---------------------

/**
 * What the account is actually configured to deliver, as opposed to what it
 * looks like it should deliver.
 *
 * `willDeliver` needs BOTH halves — an enabled endpoint AND a subscription to
 * the event type — because an event with nothing listening produces exactly the
 * same evidence as an event delivered successfully, and step 2 cannot tell them
 * apart on its own.
 */
interface EndpointReport {
  willDeliver(eventType: string): boolean;
}

/**
 * The canonical path, from `@Controller('webhooks/stripe')` plus the
 * `api/v1` global prefix set in main.ts and api/index.ts.
 */
const WEBHOOK_PATH = '/api/v1/webhooks/stripe';

/**
 * Faults visible in the endpoint URL alone, before anything is delivered.
 *
 * Worth its own check because a redirect is invisible from the Stripe
 * dashboard's summary and produces the same evidence as a dead server: failed
 * deliveries, and bookings that stay pending after the money is taken.
 *
 * Stripe does NOT follow redirects. A 308 is a failed delivery, not a detour —
 * so a URL one character off, a trailing slash, is indistinguishable in its
 * consequences from having no endpoint at all.
 */
function urlProblems(raw: string): string[] {
  const problems: string[] = [];

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return [`"${raw}" is not a valid URL.`];
  }

  // The observed failure: Vercel normalises a trailing slash with a 308 to the
  // clean path, Stripe does not follow it, and every delivery fails.
  if (url.pathname.endsWith('/') && url.pathname !== '/') {
    problems.push(
      `URL ends in a slash. The host answers that with a 308 redirect to ` +
        `${url.pathname.replace(/\/+$/, '')}, and Stripe does not follow ` +
        `redirects — so every delivery to this endpoint FAILS. Remove the ` +
        `trailing slash in the dashboard.`,
    );
  }

  if (url.protocol !== 'https:') {
    problems.push(
      `URL is ${url.protocol}//. Stripe requires https for live endpoints, ` +
        `and an http URL is usually redirected, which Stripe will not follow.`,
    );
  }

  const path = url.pathname.replace(/\/+$/, '');
  if (path !== WEBHOOK_PATH) {
    problems.push(
      `Path is "${path}", but this application serves the Stripe webhook at ` +
        `"${WEBHOOK_PATH}". Anything else is a 404, or — if it is the frontend ` +
        `domain — the SPA's index.html with a 200, which looks like a ` +
        `successful delivery and confirms nothing.`,
    );
  }

  return problems;
}

async function checkEndpoints(stripe: Stripe): Promise<EndpointReport> {
  heading('Webhook endpoints');

  const endpoints = await stripe.webhookEndpoints.list({ limit: 20 });
  const ours = endpoints.data.filter((endpoint) =>
    endpoint.url.includes('/webhooks/stripe'),
  );

  const live = ours.filter((endpoint) => endpoint.status === 'enabled');
  const report: EndpointReport = {
    willDeliver: (eventType) =>
      live.some(
        (endpoint) =>
          endpoint.enabled_events.includes('*') ||
          endpoint.enabled_events.includes(eventType),
      ),
  };

  if (ours.length === 0) {
    bad(
      'No endpoint on this account posts to a /webhooks/stripe URL. Nothing ' +
        'is being delivered to this application at all.',
    );
    for (const endpoint of endpoints.data) info(`(saw ${endpoint.url})`);
    return report;
  }

  for (const endpoint of ours) {
    say(`  ${endpoint.url}`);

    for (const problem of urlProblems(endpoint.url)) bad(problem);

    if (endpoint.status !== 'enabled') {
      bad(
        `Endpoint is ${endpoint.status}. Stripe is not delivering to it. ` +
          `Stripe disables an endpoint by itself after days of failed ` +
          `deliveries — so this is usually the scar of an earlier outage ` +
          `rather than something anyone switched off. Re-run with ` +
          `--fix-endpoint. That does NOT re-send what was missed while it was ` +
          `off; use --replay for those.`,
      );
    }

    // `*` is a valid subscription and covers everything.
    const events = endpoint.enabled_events;
    const wildcard = events.includes('*');
    const missing = wildcard
      ? []
      : HANDLED_EVENTS.filter((event) => !events.includes(event));

    if (missing.length > 0) {
      bad(
        `Not subscribed to ${missing.join(', ')} — ` +
          `${missing.some((event) => CONFIRMING_EVENTS.includes(event)) ? 'payments through this endpoint cannot confirm a booking.' : 'unpaid sessions will not be closed off.'}`,
      );
    } else {
      ok(`Subscribed to all ${HANDLED_EVENTS.length} checkout.session events.`);
    }

    // Not an error, but the single most common misconfiguration: these fire on
    // the same payments and look like the right thing, and they carry none of
    // the session metadata that links a payment to a prospect and a booking.
    const decoys = events.filter((event) =>
      event.startsWith('payment_intent.'),
    );
    if (decoys.length > 0 && !wildcard) {
      info(
        `Also subscribed to ${decoys.join(', ')}. Harmless, but these cannot ` +
          `confirm anything — they have no session metadata.`,
      );
    }
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    bad('STRIPE_WEBHOOK_SECRET is not set — every delivery is rejected 401.');
  } else if (ours.length > 1) {
    // The secret is per-endpoint and the API will not reveal it, so this is as
    // far as the check can go: say it out loud rather than imply it is fine.
    info(
      `${ours.length} endpoints match. STRIPE_WEBHOOK_SECRET can only be the ` +
        `signing secret of ONE of them; deliveries from the others are 401.`,
    );
  }

  return report;
}

// --- 2. What did Stripe actually send, and did it get a 2xx? ----------------

async function resolveSession(
  stripe: Stripe,
  id: string,
  endpoints: EndpointReport,
): Promise<Stripe.Checkout.Session | null> {
  heading(`Stripe: ${id}`);

  if (id.startsWith('evt_')) {
    const event = await stripe.events.retrieve(id);
    info(`type       ${event.type}`);
    info(`created    ${new Date(event.created * 1000).toISOString()}`);

    if (!HANDLED_EVENTS.includes(event.type)) {
      bad(
        `This endpoint does not handle "${event.type}". It is logged and ` +
          `discarded. Bookings are confirmed by ${CONFIRMING_EVENTS.join(' / ')}.`,
      );
      return null;
    }

    // `pending_webhooks` counts deliveries Stripe has not yet had a 2xx for.
    // Non-zero means the request is failing or the server is unreachable.
    //
    // Zero does NOT mean delivered. It means nothing is outstanding, and an
    // event that was never queued in the first place — because no enabled
    // endpoint subscribed to its type — has nothing outstanding either. Read
    // alone, this field reported a disabled endpoint as a successful delivery.
    if (event.pending_webhooks > 0) {
      bad(
        `Stripe still has ${event.pending_webhooks} pending delivery for this ` +
          `event: it has not received a 2xx. The server was unreachable ` +
          `(tunnel down, server not running) or replied with an error — ` +
          `a 401 here means STRIPE_WEBHOOK_SECRET does not match this endpoint.`,
      );
    } else if (!endpoints.willDeliver(event.type)) {
      bad(
        `Nothing was ever sent. No enabled endpoint is subscribed to ` +
          `${event.type}, so Stripe had nowhere to deliver it — the zero ` +
          `pending deliveries above are an absence of attempts, not a success.`,
      );
    } else {
      ok('Delivered — Stripe got a 2xx, so the request reached the handler.');
    }

    const object = event.data.object as { id: string; object: string };
    return object.object === 'checkout.session'
      ? describeSession(object as unknown as Stripe.Checkout.Session)
      : null;
  }

  if (id.startsWith('cs_')) {
    return describeSession(await stripe.checkout.sessions.retrieve(id));
  }

  if (id.startsWith('pi_')) {
    const sessions = await stripe.checkout.sessions.list({
      payment_intent: id,
      limit: 1,
    });
    const session = sessions.data[0];
    if (!session) {
      bad(
        `No checkout session created this payment intent. It was charged ` +
          `outside the checkout flow, so there is no metadata linking it to a ` +
          `prospect and nothing here can attach it to a booking.`,
      );
      return null;
    }
    info(`payment intent belongs to session ${session.id}`);
    return describeSession(session);
  }

  bad(`"${id}" is not an evt_, cs_ or pi_ id.`);
  return null;
}

function describeSession(
  session: Stripe.Checkout.Session,
): Stripe.Checkout.Session {
  heading(`Checkout session ${session.id}`);
  info(`status         ${session.status}`);
  info(`payment_status ${session.payment_status}`);
  info(`amount_total   ${session.amount_total} ${session.currency}`);

  const paid =
    session.payment_status === 'paid' ||
    session.payment_status === 'no_payment_required';

  if (!paid) {
    bad(
      `payment_status is "${session.payment_status}" — the money is not in, ` +
        `so the handler correctly refused to confirm. A delayed payment ` +
        `method settles later via checkout.session.async_payment_succeeded.`,
    );
  } else {
    ok('Stripe considers this session paid.');
  }

  const metadata = session.metadata ?? {};
  info(`metadata       ${JSON.stringify(metadata)}`);
  if (!metadata.prospect_id) {
    bad(
      'No prospect_id in the session metadata. If our payments row is also ' +
        'missing, there is nothing to attach this money to and the handler ' +
        'gives up — see markPaidFromSession.',
    );
  }
  if (!metadata.booking_id) {
    info(
      'No booking_id in metadata — the handler falls back to the prospect’s ' +
        'latest booking, which is right unless they hold more than one.',
    );
  }

  return session;
}

// --- 3. What did we record? -------------------------------------------------

async function checkDatabase(
  db: DataSource,
  session: Stripe.Checkout.Session,
  id: string,
): Promise<void> {
  heading('This database');

  if (id.startsWith('evt_')) {
    const rows = await db.query<
      {
        status: string;
        event_type: string;
        attempts: number;
        error: string | null;
        processed_at: Date | null;
      }[]
    >(
      `SELECT status, event_type, attempts, error, processed_at
         FROM webhook_events
        WHERE provider = 'stripe' AND external_id = $1`,
      [id],
    );

    const event = rows[0];
    if (!event) {
      bad(
        `No webhook_events row for ${id}. The request never got past ` +
          `signature verification, or never arrived. Nothing downstream ran.`,
      );
    } else if (event.status === 'processed') {
      ok(
        `Handled at ${event.processed_at?.toISOString()} (${event.attempts} attempt(s)).`,
      );
    } else if (event.status === 'failed') {
      bad(`The handler threw: ${event.error}`);
    } else {
      bad(
        `Claimed ${event.attempts} time(s) but never finished — the process ` +
          `stopped mid-handler. The claim expires after five minutes and ` +
          `Stripe's retry will pick it up.`,
      );
    }
  }

  const payments = await db.query<
    {
      id: string;
      status: string;
      prospect_id: string;
      booking_id: string | null;
      amount_cents: number | null;
      paid_at: Date | null;
    }[]
  >(
    `SELECT id, status, prospect_id, booking_id, amount_cents, paid_at
       FROM payments
      WHERE provider_session_id = $1
         OR id::text = $2
      ORDER BY created_at DESC`,
    [session.id, session.metadata?.payment_id ?? ''],
  );

  const payment = payments[0];
  if (!payment) {
    bad(
      `No payments row for session ${session.id}. Checkout was started ` +
        `somewhere other than this application, or the row was never written.`,
    );
    return;
  }

  if (payment.status === 'paid') {
    ok(`Payment ${payment.id} is paid (${payment.amount_cents} cents).`);
  } else {
    bad(
      `Payment ${payment.id} is "${payment.status}" while Stripe says the ` +
        `session is ${session.payment_status}. This is the gap: the money is ` +
        `in and we have not recorded it. Re-run with --replay.`,
    );
  }

  const bookings = await db.query<
    { id: string; status: string; scheduled_at: Date | null }[]
  >(
    `SELECT id, status, scheduled_at
       FROM consultation_bookings
      WHERE id::text = $1
         OR (prospect_id::text = $2 AND status <> 'cancelled')
      ORDER BY created_at DESC
      LIMIT 3`,
    [payment.booking_id ?? '', payment.prospect_id],
  );

  if (bookings.length === 0) {
    bad(
      `Paid, with no booking for prospect ${payment.prospect_id}. The consult ` +
        `is bought and no slot is held — this one needs a human.`,
    );
  } else {
    for (const booking of bookings) {
      const when = booking.scheduled_at?.toISOString() ?? 'no time set';
      if (booking.status === 'confirmed') {
        ok(`Booking ${booking.id} is confirmed for ${when}.`);
      } else {
        bad(`Booking ${booking.id} is still "${booking.status}" (${when}).`);
      }
    }
  }

  const prospects = await db.query<{ stage: string; human_ref: string }[]>(
    `SELECT stage, human_ref FROM prospects WHERE id = $1`,
    [payment.prospect_id],
  );
  const prospect = prospects[0];
  if (prospect) {
    info(`prospect ${prospect.human_ref} is at stage "${prospect.stage}"`);
  }
}

// --- 4. Push it through by hand ---------------------------------------------

async function replaySession(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
): Promise<void> {
  heading('Replay');

  // Re-read rather than trusting the copy embedded in an event that may be
  // hours old — replaying a stale "unpaid" would confirm nothing, and
  // replaying a stale "paid" for a session since refunded would confirm the
  // wrong thing.
  const fresh = await stripe.checkout.sessions.retrieve(session.id);
  if (fresh.payment_status === 'unpaid') {
    say('  Session is unpaid. Refusing to confirm a booking nobody paid for.');
    return;
  }

  // Only reached under --replay. Creating the context connects to the
  // database, runs pending migrations and starts the reconciliation timer, so
  // a read-only run must never get this far.
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  try {
    await app.get(WebhooksService).handleStripeCheckoutCompleted({
      id: fresh.id,
      payment_intent:
        typeof fresh.payment_intent === 'string'
          ? fresh.payment_intent
          : (fresh.payment_intent?.id ?? null),
      amount_total: fresh.amount_total,
      currency: fresh.currency,
      metadata: fresh.metadata,
    });
    say('  Replayed. Re-run without --replay to confirm the booking moved.');
  } finally {
    await app.close();
  }
}

// --- Helpers ----------------------------------------------------------------

function databaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;
  return `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT ?? 5432}/${DB_NAME}`;
}

function summarise(): void {
  heading('Verdict');
  if (problems.length === 0) {
    say('  Nothing wrong found on this path.');
    return;
  }
  // The first is the one to fix. The rest are usually its consequences — an
  // unrecorded payment always drags an unconfirmed booking behind it.
  say(`  ${problems[0]}`);
  if (problems.length > 1) {
    say(
      `\n  ${problems.length - 1} further symptom(s) above, likely downstream of it.`,
    );
  }
  process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(`\nstripe-doctor failed: ${(error as Error).message}`);
  process.exit(1);
});
