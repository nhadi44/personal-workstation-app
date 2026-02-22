import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateUserInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  provider?: string;
  providerId?: string;
  role?: string;
}

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserInput) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        provider: data.provider ?? null,
        providerId: data.providerId ?? null,
        role: data.role ?? 'USER',
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByProvider(provider: string, providerId: string) {
    return this.prisma.user.findFirst({
      where: { provider, providerId },
    });
  }

  async listUsers() {
    return this.prisma.user.findMany();
  }

  async updateRole(userId: string, role: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  async update(id: string, data: Record<string, any>) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
