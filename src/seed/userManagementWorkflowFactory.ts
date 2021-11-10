import { Injectable, Logger } from '@nestjs/common';
import { ManagementWorkflowKey } from '../management-workflow/entities/managementWorkflow.entity';
import { UserManagementWorkflow } from '../user-management-workflow/entities/userManagementWorkflow.entity';
import { SeedConfig } from './seed.config';
import { ManagementWorkflowService } from '../management-workflow/managementWorkflow.service';
import { UserManagementWorkflowService } from '../user-management-workflow/userManagementWorkflow.service';

@Injectable()
export class UserManagementWorkflowFactory {
  protected readonly logger: Logger;

  public constructor(
    private readonly managementWorkflowService: ManagementWorkflowService,
    private readonly userManagementWorkflowService: UserManagementWorkflowService,
    private readonly seedConfig: SeedConfig
  ) {
    this.logger = new Logger(UserManagementWorkflowFactory.name);
  }

  public async create() {
    let userManagementWorkflow: UserManagementWorkflow;
    const userId = this.seedConfig.getUserId();

    if (this.seedConfig.isDev) {
      const managementWorkflow =
        await this.managementWorkflowService.findOneOrFail({
          key: ManagementWorkflowKey.Partial,
        });
      userManagementWorkflow = this.userManagementWorkflowService.create({
        managementWorkflow,
        userId,
      });
    }

    if (userId) {
      await this.userManagementWorkflowService.nativeDelete({ userId });
    }

    await this.userManagementWorkflowService.persist(userManagementWorkflow);
  }
}
