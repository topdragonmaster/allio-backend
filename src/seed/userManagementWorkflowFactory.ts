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
    const managementWorkflow =
      await this.managementWorkflowService.findOneOrFail({
        key: ManagementWorkflowKey.Full,
      });
    let userManagementWorkflow: UserManagementWorkflow;
    if (this.seedConfig.isDev) {
      userManagementWorkflow = this.userManagementWorkflowService.create({
        id: '6b8acfa0-1c1b-4368-94f6-05c50f65da8c',
        managementWorkflow,
        userId: this.seedConfig.getUserId(),
      });
    }

    await this.userManagementWorkflowService.upsert({
      where: { id: userManagementWorkflow.id },
      data: userManagementWorkflow,
    });
  }
}
