import { type DynamicModule, Module, type Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { MicrosoftStrategy } from './strategies/microsoft.strategy';
import { SessionsModule } from '../sessions/sessions.module';
import { TwoFactorModule } from '../two-factor/two-factor.module';
import { OauthModule } from '../oauth/oauth.module';
import { UsersModule } from '../users/users.module';

@Module({})
export class AuthModule {
  static forRoot(): DynamicModule {
    return {
      module: AuthModule,
      imports: [
        PassportModule.register({ session: false }),
        JwtModule.register({}),
        ConfigModule,
        SessionsModule,
        TwoFactorModule,
        OauthModule,
        UsersModule,
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        AuthRepository,
        AccessTokenStrategy,
        RefreshTokenStrategy,
        {
          provide: 'OAUTH_STRATEGIES_INIT',
          useFactory: (config: ConfigService, ...args: any[]) => {
            // Strategies self-register with Passport on instantiation,
            // so we just need to create them when credentials exist.
          },
          inject: [ConfigService],
        },
        // Conditionally provided via factory below
        ...AuthModule.oauthProviders(),
      ],
      exports: [AuthService],
    };
  }

  private static oauthProviders(): Provider[] {
    // Wrap each OAuth strategy in a factory that returns null when
    // the required env vars are missing, preventing the crash.
    return [
      {
        provide: GoogleStrategy,
        useFactory: (config: ConfigService, authService: AuthService) => {
          if (!config.get('GOOGLE_CLIENT_ID')) return null;
          return new GoogleStrategy(config, authService);
        },
        inject: [ConfigService, AuthService],
      },
      {
        provide: MicrosoftStrategy,
        useFactory: (config: ConfigService, authService: AuthService) => {
          if (!config.get('MICROSOFT_CLIENT_ID')) return null;
          return new MicrosoftStrategy(config, authService);
        },
        inject: [ConfigService, AuthService],
      },
    ];
  }
}
