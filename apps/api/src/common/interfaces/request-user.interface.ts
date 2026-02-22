import type { Role } from '../enums/role.enum';

export interface RequestUser {
  sub: string;
  email: string;
  role: Role;
  permissions: string[];
  tokenId?: string;
  sessionId?: string;
}
