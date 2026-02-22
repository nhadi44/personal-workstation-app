import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersRepository } from '../users/users.repository';
import { OauthRepository } from './oauth.repository';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class OauthService {
  constructor(
    private readonly oauthRepository: OauthRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async validateOAuthLogin(input: {
    provider: 'GOOGLE' | 'MICROSOFT';
    providerAccountId: string;
    email?: string;
    emailVerified: boolean;
  }) {
    const existingAccount = await this.oauthRepository.findByProviderAccount(
      input.provider,
      input.providerAccountId,
    );

    if (existingAccount?.user) {
      return existingAccount.user;
    }

    if (!input.email || !input.emailVerified) {
      throw new UnauthorizedException('OAuth account email is not verified');
    }

    const existingUser = await this.usersRepository.findByEmail(input.email);

    if (existingUser) {
      await this.oauthRepository.createAccountLink({
        userId: existingUser.id,
        provider: input.provider,
        providerAccountId: input.providerAccountId,
        email: input.email,
      });

      return existingUser;
    }

    const randomPassword = `oauth-${Math.random().toString(36).slice(2)}`;
    const passwordHash = await bcrypt.hash(randomPassword, 12);
    const createdUser = await this.usersRepository.create({
      email: input.email,
      password: passwordHash,
    });

    if (!createdUser?.id) {
      throw new ConflictException('Unable to create user from OAuth profile');
    }

    await this.oauthRepository.createAccountLink({
      userId: createdUser.id,
      provider: input.provider,
      providerAccountId: input.providerAccountId,
      email: input.email,
    });

    return createdUser;
  }
}
