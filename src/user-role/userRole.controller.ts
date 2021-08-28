import { Controller } from '@nestjs/common';
import { UserRoleService } from './userRole.service';

@Controller('User-Role')
export class UserRoleController {
  constructor(private readonly userRoleService: UserRoleService) {}
}
