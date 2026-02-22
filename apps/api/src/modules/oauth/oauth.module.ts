import { Module } from '@nestjs/common';
import { OauthRepository } from './oauth.repository';
import { OauthService } from './oauth.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [OauthRepository, OauthService],
  exports: [OauthService],
})
export class OauthModule {}
