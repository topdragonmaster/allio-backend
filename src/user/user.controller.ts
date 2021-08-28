import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { UserService } from './user.service';

@Controller('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiQuery({ name: 'showStatus', required: false })
  @Get()
  async findByUsernameOrEmail(
    @Query('identity') identity?: string,
    @Query('showStatus') showStatus?: string
  ) {
    const populate = !showStatus ? undefined : ['status'];
    const user = await this.userService.findActiveUserByIdentity(
      identity,
      populate
    );
    return user.toObject();
  }
}
