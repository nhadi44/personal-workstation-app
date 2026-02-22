import { Module } from '@nestjs/common';
import { TwoFactorService } from './two-factor.service';
import { EmailOtpService } from './email-otp.service';

@Module({
  providers: [TwoFactorService, EmailOtpService],
  exports: [TwoFactorService, EmailOtpService],
})
export class TwoFactorModule {}
