import { Args, Query, Resolver } from '@nestjs/graphql';
import { ManagementWorkflowService } from './managementWorkflow.service';
import { ManagementWorkflow } from './entities/managementWorkflow.entity';
import { GetManagementWorkflowArgs } from './dto/getManagementWorkflow.args';

@Resolver()
export class ManagementWorkflowResolver {
  public constructor(
    private readonly managementWorkflowService: ManagementWorkflowService
  ) {}

  @Query(() => [ManagementWorkflow], { name: 'getManagementWorkflowList' })
  async getManagementWorkflowList(
    @Args() args: GetManagementWorkflowArgs
  ): Promise<ManagementWorkflow[]> {
    return this.managementWorkflowService.getManagementWorkflowList(args);
  }
}
