import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'dotenv';
import { configValidationSchema } from './config.validation';

/**
 * The environment contract, and the file that documents it.
 *
 * The first test here is the one that matters: .env.example is the instruction
 * "copy this to .env and fill it in", and that instruction was false. Joi
 * rejects the empty string by default, dotenv turns `KEY=` into exactly that,
 * and .env.example is full of `KEY=` lines for keys you are not expected to
 * set yet — so following the documented setup produced a server that refused
 * to start, naming a variable the file never asked you to provide.
 *
 * Nobody hit it because everybody already had a working .env. The person who
 * would have hit it is the next one to join.
 */

const EXAMPLE_PATH = join(__dirname, '../../.env.example');

/** The file as dotenv would load it — what you actually get after copying it. */
function exampleEnv(): Record<string, string> {
  return parse(readFileSync(EXAMPLE_PATH));
}

/**
 * Every key the file mentions, including the ones commented out.
 *
 * The DB_* parts are deliberately commented: they are the alternative spelling
 * of DATABASE_URL, and having both live would be two connection settings
 * fighting. A commented `# DB_HOST=localhost` still documents the variable —
 * it tells you the name, the shape and that it is a choice — so it counts here
 * even though dotenv skips it.
 */
function documentedKeys(): Set<string> {
  const text = readFileSync(EXAMPLE_PATH, 'utf8');
  const keys = [...text.matchAll(/^\s*#?\s*([A-Z][A-Z0-9_]*)=/gm)].map(
    (match) => match[1],
  );
  return new Set(keys);
}

/** Validates the way @nestjs/config does — same options, or this proves nothing. */
function validate(env: Record<string, string>) {
  return configValidationSchema.validate(env, {
    abortEarly: false,
    allowUnknown: true,
  });
}

describe('.env.example', () => {
  it('boots after a copy and a JWT secret', () => {
    // Exactly what a new engineer does: copy the file, generate the one
    // secret it says has no default, start the server.
    const { error } = validate({ ...exampleEnv(), JWT_SECRET: 'a-secret' });

    expect(error?.message).toBeUndefined();
  });

  it('documents every variable the app reads', () => {
    // A key the code reads and the example omits is a feature that silently
    // does nothing in a fresh checkout, discovered later and from the symptom.
    const documented = documentedKeys();
    const described = Object.keys(configValidationSchema.describe().keys);

    expect(described.filter((key) => !documented.has(key))).toEqual([]);
  });
});

describe('empty values', () => {
  it('accepts a key left blank rather than treating it as malformed', () => {
    const { error } = validate({
      JWT_SECRET: 'a-secret',
      STRIPE_SECRET_KEY: '',
      STRIPE_WEBHOOK_SECRET: '',
      STRIPE_CONSULT_PRICE_ID: '',
      CALENDLY_WEBHOOK_SIGNING_KEY: '',
      SLACK_LEADS_WEBHOOK_URL: '',
      LEAD_NOTIFICATION_EMAIL: '',
      DATABASE_URL: '',
    });

    expect(error?.message).toBeUndefined();
  });

  it('still rejects a value that is present and wrong', () => {
    // The point of allowing '' is not to stop checking. A key someone has
    // actually typed something into gets the full treatment.
    const { error } = validate({
      JWT_SECRET: 'a-secret',
      STRIPE_SECRET_KEY: 'pk_test_publishable',
    });

    expect(error?.message).toMatch(/sk_test_/);
  });
});

describe('the mistakes worth failing at boot for', () => {
  it('names the publishable-key mix-up', () => {
    const { error } = validate({
      JWT_SECRET: 'x',
      STRIPE_SECRET_KEY: 'pk_live_abc',
    });

    expect(error?.message).toMatch(/publishable/i);
  });

  it('rejects the Product id sitting next to the Price id', () => {
    // Made here twice. Unfound until checkout, where the visitor is told to
    // "try again shortly" for a fault entirely on our side.
    const { error } = validate({
      JWT_SECRET: 'x',
      STRIPE_CONSULT_PRICE_ID: 'prod_Tjcd1bj3pWGwNg',
    });

    expect(error?.message).toMatch(/price_/);
  });

  it('rejects a bare amount as the price', () => {
    const { error } = validate({
      JWT_SECRET: 'x',
      STRIPE_CONSULT_PRICE_ID: '0.01',
    });

    expect(error?.message).toMatch(/not an amount/i);
  });

  it('rejects a webhook secret that is not one', () => {
    const { error } = validate({
      JWT_SECRET: 'x',
      STRIPE_WEBHOOK_SECRET: 'sk_test_wrong_variable',
    });

    expect(error?.message).toMatch(/whsec_/);
  });

  it('refuses to start with no JWT secret at all', () => {
    // The one variable with no default and no graceful degradation. A
    // fallback here is a fallback that reaches production.
    const { error } = validate({});

    expect(error?.message).toMatch(/JWT_SECRET/);
  });
});

describe('notification settings', () => {
  it('validates them, having previously only read them', () => {
    // This block was commented out of the schema while configuration.ts went
    // on reading every key in it. The failure landed inside the notifier's
    // catch — which swallows errors so a lead is never lost to a broken Slack
    // hook — so the alert simply never arrived and nothing said why.
    const { error } = validate({
      JWT_SECRET: 'x',
      SLACK_LEADS_WEBHOOK_URL: 'not a url',
    });

    expect(error?.message).toMatch(/SLACK_LEADS_WEBHOOK_URL/);
  });

  it('catches an unusable SMTP port', () => {
    const { error } = validate({ JWT_SECRET: 'x', SMTP_PORT: '99999' });

    expect(error?.message).toMatch(/SMTP_PORT/);
  });

  it('catches a malformed notification address', () => {
    const { error } = validate({
      JWT_SECRET: 'x',
      LEAD_NOTIFICATION_EMAIL: 'agent@',
    });

    expect(error?.message).toMatch(/LEAD_NOTIFICATION_EMAIL/);
  });
});
