import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const { PrismaClient } = require('@repo/database');

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client: any;
  private readonly pool: Pool;

  constructor(private readonly configService: ConfigService) {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    this.pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(this.pool);
    this.client = new PrismaClient({ adapter });
  }

  get user() {
    return this.client.user;
  }

  get oAuthAccount() {
    return this.client.oAuthAccount ?? this.client.oauthAccount;
  }

  async onModuleInit() {
    if (typeof this.client.$connect === 'function') {
      await this.client.$connect();
    }
  }

  async onModuleDestroy() {
    if (typeof this.client.$disconnect === 'function') {
      await this.client.$disconnect();
    }
    await this.pool.end();
  }
}
