/**
 * Creates the consultation fee Price in Stripe, correctly, and tells you what
 * to paste where.
 *
 *   npm run stripe:price                      list the products, pick one
 *   npm run stripe:price -- 150 --product=prod_XXX
 *   npm run stripe:price -- 150 --product=prod_XXX --archive-old
 *
 * The amount is in DOLLARS, always. That is the entire reason this script
 * exists.
 *
 * Creating this Price by hand has now failed twice the same way, and the
 * mistake is not carelessness — it is that the amount means different things in
 * different places. The dashboard field is dollars. `--unit-amount` on the CLI
 * is whole cents. `unit_amount_decimal` on the API is cents and ACCEPTS
 * FRACTIONS, which is how a fee meant to be A$0.10 was stored as `0.1` cents —
 * A$0.001 — twice. Stripe takes that happily at creation and only rejects it
 * later, at checkout, in front of a paying customer.
 *
 * So this script takes one unit and one unit only, refuses anything it cannot
 * represent as a whole number of cents, sets `unit_amount` (never the decimal
 * variant), and then reads the Price back to prove what was stored. A Price
 * cannot be edited after creation, so verifying afterwards is the only chance
 * to catch a bad one before it reaches a customer.
 */
import { config } from 'dotenv';
import Stripe from 'stripe';

config();

/**
 * Stripe's minimum charge, in cents. Below this Checkout rejects the session
 * for a different reason, which is a demoralising thing to discover on the
 * second attempt.
 */
const MINIMUM_CENTS: Record<string, number> = {
  aud: 50,
  cad: 50,
  eur: 50,
  gbp: 30,
  jpy: 50,
  nzd: 50,
  sgd: 50,
  usd: 50,
};

const say = (line = '') => console.log(line);

/**
 * Dollars to whole cents, refusing anything in between.
 *
 * Parsed from the STRING rather than via `Number(x) * 100`, because floating
 * point turns 150.10 into 15009.999999999998 and rounding that quietly is how
 * you end up off by a cent. More importantly it rejects `0.001` outright
 * instead of silently flooring it to zero — that input is the whole bug, and it
 * deserves to stop the script rather than become a Price.
 */
function toCents(raw: string): number {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(raw.trim());
  if (!match) {
    throw new Error(
      `"${raw}" is not an amount in dollars. Give it as dollars and cents — ` +
        `150, 150.00 or 0.50. More than two decimal places is a fraction of a ` +
        `cent, which Checkout cannot charge: that is exactly what went wrong ` +
        `with the last two prices.`,
    );
  }

  const [, whole, fraction = ''] = match;
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
}

function formatMoney(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const flag = (name: string) =>
    args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    say('STRIPE_SECRET_KEY is not set. Nothing to talk to Stripe with.');
    process.exitCode = 1;
    return;
  }
  const stripe = new Stripe(secretKey);

  const currency = (flag('currency') ?? 'aud').toLowerCase();
  const productId = flag('product');
  const amount = args.find((a) => !a.startsWith('--'));

  // --- No amount, or no product: help rather than fail -----------------------

  if (!amount || !productId) {
    say('\nProducts on this account:\n');
    const products = await stripe.products.list({ limit: 20, active: true });

    if (products.data.length === 0) {
      say('  (none — create one in the dashboard first)');
    }
    for (const product of products.data) {
      say(`  ${product.id}   ${product.name}`);
    }

    say('\nThen:\n');
    say(
      `  npm run stripe:price -- <amount in dollars> --product=<prod_...>\n` +
        `  npm run stripe:price -- 150 --product=${products.data[0]?.id ?? 'prod_XXX'}\n`,
    );
    return;
  }

  // --- Validate before creating, because a Price cannot be edited -----------

  const cents = toCents(amount);
  const minimum = MINIMUM_CENTS[currency];

  if (minimum !== undefined && cents < minimum) {
    throw new Error(
      `${formatMoney(cents, currency)} is below Stripe's minimum charge of ` +
        `${formatMoney(minimum, currency)}. Checkout would reject it.`,
    );
  }

  say(
    `\nCreating a one-off price of ${formatMoney(cents, currency)} ` +
      `on ${productId}...`,
  );

  // `unit_amount` takes an integer number of cents and cannot express a
  // fraction of one. `unit_amount_decimal` can, and that is the whole reason
  // this went wrong twice — so it is deliberately not used here.
  const created = await stripe.prices.create({
    product: productId,
    unit_amount: cents,
    currency,
  });

  // --- Read it back. Trusting the write is what got us here ----------------

  const price = await stripe.prices.retrieve(created.id);
  const stored = String(price.unit_amount_decimal ?? '');

  if (!/^\d+$/.test(stored) || price.unit_amount !== cents) {
    throw new Error(
      `Stripe stored ${price.id} as ${stored} cents, which is not the whole ` +
        `number of cents that was sent. Do NOT use this price id.`,
    );
  }

  say(`\n  ok    ${price.id}`);
  say(`        ${formatMoney(price.unit_amount ?? 0, price.currency)}`);
  say(`        unit_amount_decimal = "${stored}"  (no decimal point: correct)`);
  say(`        type = ${price.type}, active = ${price.active}`);

  // --- Optionally close the old ones off ------------------------------------

  if (args.includes('--archive-old')) {
    const existing = await stripe.prices.list({
      product: productId,
      active: true,
      limit: 100,
    });
    const stale = existing.data.filter((p) => p.id !== price.id);

    for (const old of stale) {
      await stripe.prices.update(old.id, { active: false });
      say(`\n  archived ${old.id} (${old.unit_amount_decimal ?? '?'} cents)`);
    }
    if (stale.length === 0) say('\n  Nothing else active to archive.');
  }

  say(`\n${'-'.repeat(64)}`);
  say('Put this in BOTH places, then redeploy:\n');
  say(`  STRIPE_CONSULT_PRICE_ID=${price.id}\n`);
  say('  1. Vercel → Settings → Environment Variables   (the deployed app');
  say('     reads this one — editing .env alone changes nothing in prod)');
  say('  2. .env                                        (local dev)');
  say(`${'-'.repeat(64)}\n`);
}

main().catch((error: unknown) => {
  console.error(`\n${(error as Error).message}\n`);
  process.exit(1);
});
