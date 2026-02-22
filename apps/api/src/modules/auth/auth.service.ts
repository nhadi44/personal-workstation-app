import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersRepository } from '../users/users.repository';
import { SessionsRepository } from '../sessions/sessions.repository';
import { TwoFactorService } from '../two-factor/two-factor.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { Enable2faDto } from './dto/enable-2fa.dto';
import { Verify2faDto } from './dto/verify-2fa.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    private readonly sessionsRepository: SessionsRepository,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  // ──────────────────────────── Sign-Up ────────────────────────────
  async signUp(dto: SignUpDto) {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.usersRepository.create({
      email: dto.email,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    // Generate TOTP secret and persist it
    const secret = this.twoFactorService.generateSecret();
    await this.usersRepository.update(user.id, { twoFactorSecret: secret });

    const { otpauthUrl, qrCodeDataUrl } =
      await this.twoFactorService.buildSetupArtifact(user.email, secret);

    // Short-lived token so the client can call /2fa/enable
    const setupToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, purpose: 'two-factor-setup' },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '10m',
        issuer: 'personal-workstation-api',
      },
    );

    return {
      userId: user.id,
      email: user.email,
      setupToken,
      otpauthUrl,
      qrCodeDataUrl,
    };
  }

  // ──────────────────────────── Enable 2FA ─────────────────────────
  async enable2fa(dto: Enable2faDto) {
    const payload = await this.verifyPurposeToken(
      dto.setupToken,
      'two-factor-setup',
    );
    const user = await this.usersRepository.findById(payload.sub);
    if (!user || !user.twoFactorSecret) {
      throw new UnauthorizedException('Invalid setup flow');
    }

    this.twoFactorService.verify(dto.code, user.twoFactorSecret);

    await this.usersRepository.update(user.id, { twoFactorEnabled: true });
    return { message: '2FA enabled successfully' };
  }

  // ──────────────────────────── Sign-In (Phase 1) ──────────────────
  async signIn(dto: SignInDto) {
    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user?.password) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    if (user.twoFactorEnabled) {
      const challengeToken = await this.jwtService.signAsync(
        { sub: user.id, email: user.email, purpose: 'two-factor-challenge' },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '5m',
          issuer: 'personal-workstation-api',
        },
      );
      return { requires2FA: true, challengeToken };
    }

    return this.issueTokens(user.id, user.email, user.role);
  }

  // ──────────────────────────── Verify 2FA (Phase 2) ───────────────
  async verify2fa(dto: Verify2faDto) {
    const payload = await this.verifyPurposeToken(
      dto.challengeToken,
      'two-factor-challenge',
    );
    const user = await this.usersRepository.findById(payload.sub);
    if (!user?.twoFactorSecret) {
      throw new UnauthorizedException('2FA not configured');
    }

    this.twoFactorService.verify(dto.code, user.twoFactorSecret);

    return this.issueTokens(user.id, user.email, user.role);
  }

  // ──────────────────────────── Refresh ────────────────────────────
  async refreshTokens(userId: string, oldRefreshToken: string) {
    const valid = await this.sessionsRepository.validate(
      userId,
      oldRefreshToken,
    );
    if (!valid) {
      await this.sessionsRepository.revokeAll(userId);
      throw new UnauthorizedException(
        'Refresh token reuse detected — all sessions revoked',
      );
    }

    await this.sessionsRepository.revoke(userId, oldRefreshToken);

    const user = await this.usersRepository.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    return this.issueTokens(user.id, user.email, user.role);
  }

  // ──────────────────────────── Logout ─────────────────────────────
  async logout(userId: string) {
    await this.sessionsRepository.revokeAll(userId);
    return { message: 'Logged out successfully' };
  }

  // ──────────────────────────── OAuth ──────────────────────────────
  async authenticateOAuthLogin(profile: {
    provider: string;
    providerId: string;
    email: string;
    firstName?: string;
    lastName?: string;
  }) {
    // Check if user exists by provider
    let user = await this.usersRepository.findByProvider(
      profile.provider,
      profile.providerId,
    );

    if (!user) {
      // Check if user exists by email (link accounts)
      user = await this.usersRepository.findByEmail(profile.email);

      if (user) {
        // Link OAuth provider to existing user
        await this.usersRepository.update(user.id, {
          provider: profile.provider,
          providerId: profile.providerId,
        });
      } else {
        // Create new user from OAuth
        user = await this.usersRepository.create({
          email: profile.email,
          password: '', // No password for OAuth users
          firstName: profile.firstName,
          lastName: profile.lastName,
          provider: profile.provider,
          providerId: profile.providerId,
        });
      }
    }

    return this.issueTokens(user.id, user.email, user.role);
  }

  // ──────────────────────────── Helpers ────────────────────────────
  private async issueTokens(userId: string, email: string, role: string) {
    const permissions = this.getPermissionsForRole(role);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role, permissions },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '15m',
          issuer: 'personal-workstation-api',
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, type: 'refresh' },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
          issuer: 'personal-workstation-api',
        },
      ),
    ]);

    // Store refresh token hash in Redis
    await this.sessionsRepository.store(userId, refreshToken);

    return { accessToken, refreshToken, expiresIn: 900 };
  }

  private getPermissionsForRole(role: string): string[] {
    const permissionsMap: Record<string, string[]> = {
      SUPERADMIN: ['*'],
      ADMIN: [
        'users.read',
        'users.update',
        'users.delete',
        'profile.read',
        'profile.update',
      ],
      USER: ['profile.read'],
    };
    return permissionsMap[role] ?? [];
  }

  private async verifyPurposeToken(
    token: string,
    expectedPurpose: string,
  ): Promise<{ sub: string; email: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });
      if (payload.purpose !== expectedPurpose) throw new Error();
      return payload;
    } catch {
      throw new UnauthorizedException('Token invalid or expired');
    }
  }
}
