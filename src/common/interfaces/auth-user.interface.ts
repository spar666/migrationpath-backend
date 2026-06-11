/**
 * Typed representation of the authenticated user attached to requests.
 * Populated by JwtStrategy.validate().
 *
 * This is a class (not interface) so it can be used in decorated
 * parameter signatures with emitDecoratorMetadata + isolatedModules.
 */
export class AuthUser {
  id: string;
  email: string;
  role?: string;
  full_name?: string;
  [key: string]: any;
}
