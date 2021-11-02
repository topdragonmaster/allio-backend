import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import {
  ManagementWorkflow,
  ManagementWorkflowKey,
} from '../management-workflow/entities/managementWorkflow.entity';
import { UserManagementWorkflow } from '../user-management-workflow/entities/userManagementWorkflow.entity';
import { BaseService } from '../shared/base.service';
import { SeedConfig } from './seed.config';

@Injectable()
export class UserManagementWorkflowFactory extends BaseService<UserManagementWorkflow> {
  protected readonly logger: Logger;

  public constructor(
    @InjectRepository(ManagementWorkflow)
    private readonly managementWorkflowRepo: EntityRepository<ManagementWorkflow>,
    @InjectRepository(UserManagementWorkflow)
    private readonly userManagementWorkflowRepo: EntityRepository<UserManagementWorkflow>,
    private readonly seedConfig: SeedConfig
  ) {
    super(userManagementWorkflowRepo);
    this.logger = new Logger(UserManagementWorkflowFactory.name);
  }

  public async create() {
    const managementWorkflow = await this.managementWorkflowRepo.findOneOrFail({
      key: ManagementWorkflowKey.Full,
    });
    const userManagementWorkflow = new UserManagementWorkflow();
    if (this.seedConfig.isDev) {
      userManagementWorkflow.id = '6b8acfa0-1c1b-4368-94f6-05c50f65da8c';
      userManagementWorkflow.managementWorkflow = managementWorkflow;
      userManagementWorkflow.userId = this.seedConfig.getUserId();
    }

    await this.upsert({
      where: { id: userManagementWorkflow.id },
      data: userManagementWorkflow,
    });
  }
}
