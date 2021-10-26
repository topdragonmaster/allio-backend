import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserManagementWorkflow } from './entities/userManagementWorkflow.entity';
import { UserManagementWorkflowResolver } from './userManagementWorkflow.resolver';
import { UserManagementWorkflowService } from './userManagementWorkflow.service';
import { AuthModule } from '../auth/auth.module';
import { ManagementWorkflow } from '../management-workflow/entities/managementWorkflow.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([UserManagementWorkflow, ManagementWorkflow]),
    AuthModule,
  ],
  providers: [UserManagementWorkflowResolver, UserManagementWorkflowService],
})
export class UserManagementWorkflowModule {}
