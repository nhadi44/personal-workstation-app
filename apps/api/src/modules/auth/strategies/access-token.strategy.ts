import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AUTH_CONSTANTS } from '../../../common/constants/auth.constants';
import { Role } from '../../../common/enums/role.enum';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  AUTH_CONSTANTS.ACCESS_TOKEN_STRATEGY,
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      ignoreExpiration: false,
      issuer: AUTH_CONSTANTS.TOKEN_ISSUER,
    });
  }

  validate(payload: {
    sub: string;
    email: string;
    role: Role;
    permissions?: string[];
  }) {
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions ?? [],
    };
  }
}
