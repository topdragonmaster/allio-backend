import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ManagementWorkflow } from './entities/managementWorkflow.entity';
import { ManagementWorkflowResolver } from './managementWorkflow.resolver';
import { ManagementWorkflowService } from './managementWorkflow.service';

@Module({
  imports: [MikroOrmModule.forFeature([ManagementWorkflow])],
  providers: [ManagementWorkflowResolver, ManagementWorkflowService],
  exports: [ManagementWorkflowService],
})
export class ManagementWorkflowModule {}
