import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

@Injectable()
export class RefreshTokenGuard extends AuthGuard(
  AUTH_CONSTANTS.REFRESH_TOKEN_STRATEGY,
) {}
