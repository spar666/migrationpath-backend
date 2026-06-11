import { app_role } from './roles.enum';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: (keyof typeof app_role | string)[]) => import("@nestjs/common").CustomDecorator<string>;
