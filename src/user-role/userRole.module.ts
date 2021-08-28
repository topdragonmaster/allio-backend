import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { UserRoleController } from './userRole.controller';
import { UserRole } from './userRole.entity';
import { UserRoleService } from './userRole.service';

@Module({
  imports: [MikroOrmModule.forFeature([UserRole])],
  providers: [UserRoleService],
  controllers: [UserRoleController],
})
export class UserRoleModule {}
