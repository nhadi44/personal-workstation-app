import { Role } from '../../../common/enums/role.enum';

export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: Role;
  permissions: string[];
};

export type RefreshTokenPayload = {
  sub: string;
  sessionId: string;
  tokenId: string;
  type: 'refresh';
};

export type TwoFactorChallengePayload = {
  sub: string;
  email: string;
  purpose: string;
};

export type TwoFactorSetupPayload = {
  sub: string;
  email: string;
  purpose: string;
};
