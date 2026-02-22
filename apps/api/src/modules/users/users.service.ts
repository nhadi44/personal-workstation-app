import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getProfile(userId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      twoFactorEnabled: user.twoFactorEnabled,
      oauthProviders:
        user.oauthAccounts?.map((account: any) => account.provider) ?? [],
    };
  }

  async listUsers() {
    return this.usersRepository.listUsers();
  }

  async setRole(userId: string, role: Role) {
    return this.usersRepository.updateRole(userId, role);
  }
}
