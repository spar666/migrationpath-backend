import { SetMetadata } from '@nestjs/common';
import { app_role } from './roles.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: (keyof typeof app_role | string)[]) =>
  SetMetadata(ROLES_KEY, roles);
