import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserManagementWorkflow } from './entities/userManagementWorkflow.entity';
import { UserManagementWorkflowResolver } from './userManagementWorkflow.resolver';
import { UserManagementWorkflowService } from './userManagementWorkflow.service';
import { AuthModule } from '../auth/auth.module';
import { ManagementWorkflowModule } from '../management-workflow/managementWorkflow.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([UserManagementWorkflow]),
    AuthModule,
    ManagementWorkflowModule,
  ],
  providers: [UserManagementWorkflowResolver, UserManagementWorkflowService],
  exports: [UserManagementWorkflowService],
})
export class UserManagementWorkflowModule {}
