"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const dotenv_1 = require("dotenv");
const stripe_1 = __importDefault(require("stripe"));
const typeorm_1 = require("typeorm");
const app_module_1 = require("../src/app.module");
const webhooks_service_1 = require("../src/webhooks/webhooks.service");
(0, dotenv_1.config)();
const HANDLED_EVENTS = [
    'checkout.session.completed',
    'checkout.session.async_payment_succeeded',
    'checkout.session.async_payment_failed',
    'checkout.session.expired',
];
const CONFIRMING_EVENTS = HANDLED_EVENTS.slice(0, 2);
const problems = [];
const say = (line = '') => console.log(line);
const heading = (line) => say(`\n${line}\n${'-'.repeat(line.length)}`);
const ok = (line) => say(`  ok    ${line}`);
const info = (line) => say(`        ${line}`);
const bad = (line) => {
    say(`  BAD   ${line}`);
    problems.push(line);
};
async function main() {
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
    const stripe = new stripe_1.default(secretKey);
    if (fixEndpoint)
        await fixEndpoints(stripe);
    const endpoints = await checkEndpoints(stripe);
    if (!id) {
        say('\nPass an event, session or payment-intent id to trace one payment ' +
            'through to its booking.');
        return summarise();
    }
    const session = await resolveSession(stripe, id, endpoints);
    if (!session)
        return summarise();
    const db = new typeorm_1.DataSource({
        type: 'postgres',
        url: databaseUrl(),
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        logging: false,
    });
    await db.initialize();
    try {
        await checkDatabase(db, session, id);
    }
    finally {
        await db.destroy();
    }
    if (replay)
        await replaySession(stripe, session);
    summarise();
}
async function fixEndpoints(stripe) {
    heading('Repairing the endpoint');
    const endpoints = await stripe.webhookEndpoints.list({ limit: 20 });
    const ours = endpoints.data.filter((endpoint) => endpoint.url.includes('/webhooks/stripe'));
    if (ours.length === 0) {
        say('  Nothing to repair — no endpoint points at this application.');
        return;
    }
    for (const endpoint of ours) {
        const merged = [
            ...new Set([...endpoint.enabled_events, ...HANDLED_EVENTS]),
        ];
        const added = merged.length - endpoint.enabled_events.length;
        const wasDisabled = endpoint.status !== 'enabled';
        if (!wasDisabled && added === 0) {
            say(`  ${endpoint.url}\n        already correct — left alone.`);
            continue;
        }
        await stripe.webhookEndpoints.update(endpoint.id, {
            disabled: false,
            ...(endpoint.enabled_events.includes('*')
                ? {}
                : { enabled_events: merged }),
        });
        say(`  ${endpoint.url}`);
        if (wasDisabled)
            say('        enabled');
        if (added > 0)
            say(`        added ${added} event subscription(s)`);
    }
    say('\n        Events missed while it was disabled were NOT re-sent. Recover ' +
        'them with --replay.');
}
async function checkEndpoints(stripe) {
    heading('Webhook endpoints');
    const endpoints = await stripe.webhookEndpoints.list({ limit: 20 });
    const ours = endpoints.data.filter((endpoint) => endpoint.url.includes('/webhooks/stripe'));
    const live = ours.filter((endpoint) => endpoint.status === 'enabled');
    const report = {
        willDeliver: (eventType) => live.some((endpoint) => endpoint.enabled_events.includes('*') ||
            endpoint.enabled_events.includes(eventType)),
    };
    if (ours.length === 0) {
        bad('No endpoint on this account posts to a /webhooks/stripe URL. Nothing ' +
            'is being delivered to this application at all.');
        for (const endpoint of endpoints.data)
            info(`(saw ${endpoint.url})`);
        return report;
    }
    for (const endpoint of ours) {
        say(`  ${endpoint.url}`);
        if (endpoint.status !== 'enabled') {
            bad(`Endpoint is ${endpoint.status}. Stripe is not delivering to it. ` +
                `Stripe disables an endpoint by itself after days of failed ` +
                `deliveries — so this is usually the scar of an earlier outage ` +
                `rather than something anyone switched off. Re-run with ` +
                `--fix-endpoint. That does NOT re-send what was missed while it was ` +
                `off; use --replay for those.`);
        }
        const events = endpoint.enabled_events;
        const wildcard = events.includes('*');
        const missing = wildcard
            ? []
            : HANDLED_EVENTS.filter((event) => !events.includes(event));
        if (missing.length > 0) {
            bad(`Not subscribed to ${missing.join(', ')} — ` +
                `${missing.some((event) => CONFIRMING_EVENTS.includes(event)) ? 'payments through this endpoint cannot confirm a booking.' : 'unpaid sessions will not be closed off.'}`);
        }
        else {
            ok(`Subscribed to all ${HANDLED_EVENTS.length} checkout.session events.`);
        }
        const decoys = events.filter((event) => event.startsWith('payment_intent.'));
        if (decoys.length > 0 && !wildcard) {
            info(`Also subscribed to ${decoys.join(', ')}. Harmless, but these cannot ` +
                `confirm anything — they have no session metadata.`);
        }
    }
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        bad('STRIPE_WEBHOOK_SECRET is not set — every delivery is rejected 401.');
    }
    else if (ours.length > 1) {
        info(`${ours.length} endpoints match. STRIPE_WEBHOOK_SECRET can only be the ` +
            `signing secret of ONE of them; deliveries from the others are 401.`);
    }
    return report;
}
async function resolveSession(stripe, id, endpoints) {
    heading(`Stripe: ${id}`);
    if (id.startsWith('evt_')) {
        const event = await stripe.events.retrieve(id);
        info(`type       ${event.type}`);
        info(`created    ${new Date(event.created * 1000).toISOString()}`);
        if (!HANDLED_EVENTS.includes(event.type)) {
            bad(`This endpoint does not handle "${event.type}". It is logged and ` +
                `discarded. Bookings are confirmed by ${CONFIRMING_EVENTS.join(' / ')}.`);
            return null;
        }
        if (event.pending_webhooks > 0) {
            bad(`Stripe still has ${event.pending_webhooks} pending delivery for this ` +
                `event: it has not received a 2xx. The server was unreachable ` +
                `(tunnel down, server not running) or replied with an error — ` +
                `a 401 here means STRIPE_WEBHOOK_SECRET does not match this endpoint.`);
        }
        else if (!endpoints.willDeliver(event.type)) {
            bad(`Nothing was ever sent. No enabled endpoint is subscribed to ` +
                `${event.type}, so Stripe had nowhere to deliver it — the zero ` +
                `pending deliveries above are an absence of attempts, not a success.`);
        }
        else {
            ok('Delivered — Stripe got a 2xx, so the request reached the handler.');
        }
        const object = event.data.object;
        return object.object === 'checkout.session'
            ? describeSession(object)
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
            bad(`No checkout session created this payment intent. It was charged ` +
                `outside the checkout flow, so there is no metadata linking it to a ` +
                `prospect and nothing here can attach it to a booking.`);
            return null;
        }
        info(`payment intent belongs to session ${session.id}`);
        return describeSession(session);
    }
    bad(`"${id}" is not an evt_, cs_ or pi_ id.`);
    return null;
}
function describeSession(session) {
    heading(`Checkout session ${session.id}`);
    info(`status         ${session.status}`);
    info(`payment_status ${session.payment_status}`);
    info(`amount_total   ${session.amount_total} ${session.currency}`);
    const paid = session.payment_status === 'paid' ||
        session.payment_status === 'no_payment_required';
    if (!paid) {
        bad(`payment_status is "${session.payment_status}" — the money is not in, ` +
            `so the handler correctly refused to confirm. A delayed payment ` +
            `method settles later via checkout.session.async_payment_succeeded.`);
    }
    else {
        ok('Stripe considers this session paid.');
    }
    const metadata = session.metadata ?? {};
    info(`metadata       ${JSON.stringify(metadata)}`);
    if (!metadata.prospect_id) {
        bad('No prospect_id in the session metadata. If our payments row is also ' +
            'missing, there is nothing to attach this money to and the handler ' +
            'gives up — see markPaidFromSession.');
    }
    if (!metadata.booking_id) {
        info('No booking_id in metadata — the handler falls back to the prospect’s ' +
            'latest booking, which is right unless they hold more than one.');
    }
    return session;
}
async function checkDatabase(db, session, id) {
    heading('This database');
    if (id.startsWith('evt_')) {
        const rows = await db.query(`SELECT status, event_type, attempts, error, processed_at
         FROM webhook_events
        WHERE provider = 'stripe' AND external_id = $1`, [id]);
        const event = rows[0];
        if (!event) {
            bad(`No webhook_events row for ${id}. The request never got past ` +
                `signature verification, or never arrived. Nothing downstream ran.`);
        }
        else if (event.status === 'processed') {
            ok(`Handled at ${event.processed_at?.toISOString()} (${event.attempts} attempt(s)).`);
        }
        else if (event.status === 'failed') {
            bad(`The handler threw: ${event.error}`);
        }
        else {
            bad(`Claimed ${event.attempts} time(s) but never finished — the process ` +
                `stopped mid-handler. The claim expires after five minutes and ` +
                `Stripe's retry will pick it up.`);
        }
    }
    const payments = await db.query(`SELECT id, status, prospect_id, booking_id, amount_cents, paid_at
       FROM payments
      WHERE provider_session_id = $1
         OR id::text = $2
      ORDER BY created_at DESC`, [session.id, session.metadata?.payment_id ?? '']);
    const payment = payments[0];
    if (!payment) {
        bad(`No payments row for session ${session.id}. Checkout was started ` +
            `somewhere other than this application, or the row was never written.`);
        return;
    }
    if (payment.status === 'paid') {
        ok(`Payment ${payment.id} is paid (${payment.amount_cents} cents).`);
    }
    else {
        bad(`Payment ${payment.id} is "${payment.status}" while Stripe says the ` +
            `session is ${session.payment_status}. This is the gap: the money is ` +
            `in and we have not recorded it. Re-run with --replay.`);
    }
    const bookings = await db.query(`SELECT id, status, scheduled_at
       FROM consultation_bookings
      WHERE id::text = $1
         OR (prospect_id::text = $2 AND status <> 'cancelled')
      ORDER BY created_at DESC
      LIMIT 3`, [payment.booking_id ?? '', payment.prospect_id]);
    if (bookings.length === 0) {
        bad(`Paid, with no booking for prospect ${payment.prospect_id}. The consult ` +
            `is bought and no slot is held — this one needs a human.`);
    }
    else {
        for (const booking of bookings) {
            const when = booking.scheduled_at?.toISOString() ?? 'no time set';
            if (booking.status === 'confirmed') {
                ok(`Booking ${booking.id} is confirmed for ${when}.`);
            }
            else {
                bad(`Booking ${booking.id} is still "${booking.status}" (${when}).`);
            }
        }
    }
    const prospects = await db.query(`SELECT stage, human_ref FROM prospects WHERE id = $1`, [payment.prospect_id]);
    const prospect = prospects[0];
    if (prospect) {
        info(`prospect ${prospect.human_ref} is at stage "${prospect.stage}"`);
    }
}
async function replaySession(stripe, session) {
    heading('Replay');
    const fresh = await stripe.checkout.sessions.retrieve(session.id);
    if (fresh.payment_status === 'unpaid') {
        say('  Session is unpaid. Refusing to confirm a booking nobody paid for.');
        return;
    }
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log'],
    });
    try {
        await app.get(webhooks_service_1.WebhooksService).handleStripeCheckoutCompleted({
            id: fresh.id,
            payment_intent: typeof fresh.payment_intent === 'string'
                ? fresh.payment_intent
                : (fresh.payment_intent?.id ?? null),
            amount_total: fresh.amount_total,
            currency: fresh.currency,
            metadata: fresh.metadata,
        });
        say('  Replayed. Re-run without --replay to confirm the booking moved.');
    }
    finally {
        await app.close();
    }
}
function databaseUrl() {
    if (process.env.DATABASE_URL)
        return process.env.DATABASE_URL;
    const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;
    return `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT ?? 5432}/${DB_NAME}`;
}
function summarise() {
    heading('Verdict');
    if (problems.length === 0) {
        say('  Nothing wrong found on this path.');
        return;
    }
    say(`  ${problems[0]}`);
    if (problems.length > 1) {
        say(`\n  ${problems.length - 1} further symptom(s) above, likely downstream of it.`);
    }
    process.exitCode = 1;
}
main().catch((error) => {
    console.error(`\nstripe-doctor failed: ${error.message}`);
    process.exit(1);
});
//# sourceMappingURL=stripe-doctor.js.map