import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { IsEnum } from 'class-validator';

class UpdateRoleDto {
  @IsEnum(Role)
  role!: Role;
}

@Controller('users')
@UseGuards(AccessTokenGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: RequestUser) {
    return this.usersService.getProfile(user.sub);
  }

  @Get()
  @Roles(Role.ADMIN)
  listUsers() {
    return this.usersService.listUsers();
  }

  @Patch(':userId/role')
  @Roles(Role.SUPERADMIN)
  updateRole(@Param('userId') userId: string, @Body() dto: UpdateRoleDto) {
    return this.usersService.setRole(userId, dto.role);
  }
}
