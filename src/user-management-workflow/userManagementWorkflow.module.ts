import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserManagementWorkflow } from './entities/userManagementWorkflow.entity';

@Module({
  imports: [MikroOrmModule.forFeature([UserManagementWorkflow])],
})
export class UserManagementWorkflowModule {}
