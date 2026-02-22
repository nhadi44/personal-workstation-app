import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as OTPAuth from 'otpauth';
import { toDataURL } from 'qrcode';

@Injectable()
export class TwoFactorService {
  private readonly issuer = 'Personal Workstation App';

  generateSecret(): string {
    const secret = new OTPAuth.Secret({ size: 20 });
    return secret.base32;
  }

  async buildSetupArtifact(email: string, secret: string) {
    const totp = new OTPAuth.TOTP({
      issuer: this.issuer,
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret),
    });

    const otpauthUrl = totp.toString();
    const qrCodeDataUrl = await toDataURL(otpauthUrl);

    return {
      otpauthUrl,
      qrCodeDataUrl,
    };
  }

  verify(code: string, secret: string): boolean {
    const totp = new OTPAuth.TOTP({
      issuer: this.issuer,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret),
    });

    const delta = totp.validate({ token: code, window: 1 });
    if (delta === null) {
      throw new UnauthorizedException('Invalid authenticator code');
    }

    return true;
  }
}
