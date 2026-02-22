import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string) {
    return (this.prisma.user as any).findUnique({
      where: { email },
      include: { oauthAccounts: true },
    });
  }

  async findUserById(userId: string) {
    return (this.prisma.user as any).findUnique({
      where: { id: userId },
      include: { oauthAccounts: true },
    });
  }

  async createUser(input: {
    email: string;
    password: string;
    role?: Role;
    twoFactorSecret: string;
  }) {
    return (this.prisma.user as any).create({
      data: {
        email: input.email,
        password: input.password,
        role: input.role ?? Role.USER,
        twoFactorSecret: input.twoFactorSecret,
        twoFactorEnabled: false,
      },
    });
  }

  async enableTwoFactor(userId: string) {
    return (this.prisma.user as any).update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });
  }
}
