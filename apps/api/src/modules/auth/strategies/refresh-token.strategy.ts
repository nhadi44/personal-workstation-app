import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AUTH_CONSTANTS } from '../../../common/constants/auth.constants';
import { RefreshTokenPayload } from '../types/jwt-payload.type';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  AUTH_CONSTANTS.REFRESH_TOKEN_STRATEGY,
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: any) =>
          request?.cookies?.[AUTH_CONSTANTS.REFRESH_COOKIE_NAME],
      ]),
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
      ignoreExpiration: false,
      issuer: AUTH_CONSTANTS.TOKEN_ISSUER,
    } as any);
  }

  validate(_req: Request, payload: RefreshTokenPayload) {
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token type');
    }

    return {
      sub: payload.sub,
      role: 'USER',
      email: 'refresh@token.local',
      permissions: [],
      tokenId: payload.tokenId,
      sessionId: payload.sessionId,
    };
  }
}
