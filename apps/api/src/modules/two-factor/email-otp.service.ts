import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailOtpService {
  private readonly logger = new Logger(EmailOtpService.name);

  async sendOtp(email: string, code: string) {
    this.logger.warn(
      `Email OTP requested for ${email}. SMTP provider not configured yet. Code: ${code}`,
    );

    return {
      delivered: false,
      reason: 'EMAIL_PROVIDER_NOT_CONFIGURED',
    };
  }
}
