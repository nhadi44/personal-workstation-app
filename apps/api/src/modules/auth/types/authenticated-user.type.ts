import { Role } from '../../../common/enums/role.enum';

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: Role;
};
