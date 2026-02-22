import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';
import { AUTH_CONSTANTS } from '../../../common/constants/auth.constants';
import { AuthService } from '../auth.service';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(
  Strategy,
  AUTH_CONSTANTS.MICROSOFT_STRATEGY,
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('MICROSOFT_CLIENT_ID') ?? '',
      clientSecret: configService.get<string>('MICROSOFT_CLIENT_SECRET') ?? '',
      callbackURL: configService.get<string>('MICROSOFT_CALLBACK_URL') ?? '',
      scope: ['user.read'],
      passReqToCallback: true,
    } as any);
  }

  async validate(
    req: Request,
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: (error: any, user?: any) => void,
  ) {
    const primaryEmail = profile?.emails?.[0]?.value ?? profile?._json?.mail;

    const result = await this.authService.authenticateOAuthLogin({
      provider: 'MICROSOFT',
      providerId: profile?.id,
      email: primaryEmail ?? '',
    });

    done(null, result);
  }
}
