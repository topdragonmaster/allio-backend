import { Injectable } from '@nestjs/common';
import { ManagementWorkflow } from '../management-workflow/entities/managementWorkflow.entity';
import { NotFoundError } from '../shared/errors';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { UserManagementWorkflow } from './entities/userManagementWorkflow.entity';
import { SetUserManagementWorkflowArgs } from './dto/setUserManagementWorkflow.args';
import { BaseService } from '../shared/base.service';
import { ManagementWorkflowService } from '../management-workflow/managementWorkflow.service';

@Injectable()
export class UserManagementWorkflowService extends BaseService<UserManagementWorkflow> {
  public constructor(
    private readonly managementWorkflowService: ManagementWorkflowService,
    @InjectRepository(UserManagementWorkflow)
    private readonly userManagementWorkflowRepo: EntityRepository<UserManagementWorkflow>
  ) {
    super(userManagementWorkflowRepo);
  }

  public async getUserManagementWorkflow(
    userId: string,
    throwOnMissing = false
  ): Promise<ManagementWorkflow | null> {
    if (!userId) {
      throw new NotFoundError('User not found');
    }

    const userManagementWorkflow: UserManagementWorkflow = await this.findOne(
      { userId },
      {
        populate: {
          managementWorkflow: true,
        },
      }
    );

    if (throwOnMissing && !userManagementWorkflow) {
      throw new NotFoundError('Management workflow not found');
    }

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
      await this.managementWorkflowService.findOneOrFail(
        { id: managementWorkflowId },
        {
          failHandler: (): any =>
            new NotFoundError('Management workflow not found'),
        }
      );

    let userManagementWorkflow: UserManagementWorkflow = await this.findOne({
      userId,
    });

    if (!userManagementWorkflow) {
      userManagementWorkflow = this.create({
        userId,
        managementWorkflow,
      });
    } else {
      userManagementWorkflow.managementWorkflow = managementWorkflow;
    }

    await this.persistAndFlush(userManagementWorkflow);

    return userManagementWorkflow;
  }
}
