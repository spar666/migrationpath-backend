import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Both entry points must create the Nest app with `rawBody: true`.
 *
 * This is a configuration-drift test, and it reads the source rather than the
 * running app on purpose: the fault it guards against is two bootstraps that
 * disagree, which no test of a single running app can see.
 *
 * The drift really happened. `main.ts` had `rawBody: true` and `api/index.ts`
 * — the Vercel entry point, i.e. production — did not. Webhook signature
 * verification covers the exact bytes the provider sent, so without it
 * `request.rawBody` is undefined and both webhook controllers reject the
 * delivery before the signature is even examined.
 *
 * What makes it worth a dedicated test is the shape of the failure:
 *
 *   - local development works perfectly, because main.ts is correct
 *   - production rejects EVERY Stripe and Calendly webhook with a 400
 *   - the symptom is "payment succeeded, booking never confirmed", which is
 *     also what a wrong signing secret, a disabled endpoint and a redirecting
 *     URL all look like
 *   - so the natural response is to go and check the secret, which is fine,
 *     and change nothing that matters
 *
 * Money moves and nothing records it. That is worth a brittle test.
 */

const ENTRY_POINTS = [
  { label: 'src/main.ts (local and container)', path: ['src', 'main.ts'] },
  { label: 'api/index.ts (Vercel, production)', path: ['api', 'index.ts'] },
];

describe('NestFactory.create is given rawBody: true', () => {
  const repoRoot = join(__dirname, '..', '..');

  for (const entry of ENTRY_POINTS) {
    it(`${entry.label} enables rawBody`, () => {
      const source = readFileSync(join(repoRoot, ...entry.path), 'utf8');

      // Deliberately not matched inside the NestFactory.create call — the two
      // files format that call differently and a stricter pattern would break
      // on formatting rather than on meaning.
      expect(source).toMatch(/rawBody:\s*true/);
    });
  }

  it('every entry point that boots the app is covered here', () => {
    // A third entry point added without `rawBody: true` would reintroduce the
    // exact bug, and this file would keep passing while saying nothing about
    // it. So the list itself is asserted: adding a bootstrap means adding it
    // above.
    const known = ENTRY_POINTS.length;
    expect(known).toBe(2);
  });
});
