import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import * as crypto from 'crypto';

const REFRESH_PREFIX = 'refresh_sessions:';
const REFRESH_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

@Injectable()
export class SessionsRepository {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  /**
   * Store a refresh token hash for a user
   */
  async store(userId: string, refreshToken: string): Promise<void> {
    const hash = this.hashToken(refreshToken);
    const key = `${REFRESH_PREFIX}${userId}`;
    await this.redis.sadd(key, hash);
    await this.redis.expire(key, REFRESH_TTL);
  }

  /**
   * Validate that a refresh token exists for the user
   */
  async validate(userId: string, refreshToken: string): Promise<boolean> {
    const hash = this.hashToken(refreshToken);
    const key = `${REFRESH_PREFIX}${userId}`;
    const isMember = await this.redis.sismember(key, hash);
    return isMember === 1;
  }

  /**
   * Revoke a single refresh token
   */
  async revoke(userId: string, refreshToken: string): Promise<void> {
    const hash = this.hashToken(refreshToken);
    const key = `${REFRESH_PREFIX}${userId}`;
    await this.redis.srem(key, hash);
  }

  /**
   * Revoke all refresh tokens for a user (logout everywhere)
   */
  async revokeAll(userId: string): Promise<void> {
    const key = `${REFRESH_PREFIX}${userId}`;
    await this.redis.del(key);
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
