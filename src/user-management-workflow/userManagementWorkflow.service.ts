import { Injectable } from '@nestjs/common';
import { ManagementWorkflow } from '../management-workflow/entities/managementWorkflow.entity';
import { NotFoundError } from '../shared/errors';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { UserManagementWorkflow } from './entities/userManagementWorkflow.entity';
import { SetUserManagementWorkflowArgs } from './dto/setUserManagementWorkflow.args';

@Injectable()
export class UserManagementWorkflowService {
  public constructor(
    @InjectRepository(ManagementWorkflow)
    private readonly managementWorkflowRepo: EntityRepository<ManagementWorkflow>,
    @InjectRepository(UserManagementWorkflow)
    private readonly userManagementWorkflowRepo: EntityRepository<UserManagementWorkflow>
  ) {}

  public async getUserManagementWorkflow(
    userId: string
  ): Promise<ManagementWorkflow | null> {
    if (!userId) {
      throw new NotFoundError('User not found');
    }

    const userManagementWorkflow: UserManagementWorkflow =
      await this.userManagementWorkflowRepo.findOne(
        { userId },
        {
          populate: {
            managementWorkflow: true,
          },
        }
      );

    return userManagementWorkflow?.managementWorkflow;
  }

  public async setUserManagementWorkflow(
    args: SetUserManagementWorkflowArgs,
    userId: string
  ): Promise<UserManagementWorkflow> {
    if (!userId) {
      throw new NotFoundError('User not found');
    }

    const { managementWorkflowId } = args;
    const managementWorkflow: ManagementWorkflow =
      await this.managementWorkflowRepo.findOneOrFail(
        { id: managementWorkflowId },
        {
          failHandler: (): any =>
            new NotFoundError('Management workflow not found'),
        }
      );

    let userManagementWorkflow: UserManagementWorkflow =
      await this.userManagementWorkflowRepo.findOne({ userId });

    if (!userManagementWorkflow) {
      userManagementWorkflow = this.userManagementWorkflowRepo.create({
        userId,
        managementWorkflow,
      });
    } else {
      userManagementWorkflow.managementWorkflow = managementWorkflow;
    }

    await this.userManagementWorkflowRepo.persistAndFlush(
      userManagementWorkflow
    );

    return userManagementWorkflow;
  }
}
