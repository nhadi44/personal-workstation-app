import { Module } from '@nestjs/common';
import { SessionsRepository } from './sessions.repository';
import { RedisModule } from '../../redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [SessionsRepository],
  exports: [SessionsRepository],
})
export class SessionsModule {}
