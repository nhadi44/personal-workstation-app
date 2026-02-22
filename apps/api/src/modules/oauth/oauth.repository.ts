import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OauthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProviderAccount(
    provider: 'GOOGLE' | 'MICROSOFT',
    providerAccountId: string,
  ) {
    return (this.prisma.oAuthAccount as any).findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
      include: {
        user: true,
      },
    });
  }

  async createAccountLink(input: {
    userId: string;
    provider: 'GOOGLE' | 'MICROSOFT';
    providerAccountId: string;
    email?: string;
  }) {
    return (this.prisma.oAuthAccount as any).create({
      data: {
        userId: input.userId,
        provider: input.provider,
        providerAccountId: input.providerAccountId,
        email: input.email,
      },
    });
  }
}
