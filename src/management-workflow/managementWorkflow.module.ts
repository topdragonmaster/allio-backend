import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ManagementWorkflow } from './entities/managementWorkflow.entity';

@Module({
  imports: [MikroOrmModule.forFeature([ManagementWorkflow])],
})
export class ManagementWorkflowModule {}
