import { Injectable } from '@nestjs/common';
import { ManagementWorkflow } from '../management-workflow/entities/managementWorkflow.entity';
import { NotFoundError } from '../shared/errors';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { UserManagementWorkflow } from './entities/userManagementWorkflow.entity';
import { SetUserManagementWorkflowArgs } from './dto/setUserManagementWorkflow.args';
import { BaseService } from '../shared/base.service';
import { ManagementWorkflowService } from '../management-workflow/managementWorkflow.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  USER_MANAGEMENT_WORKFLOW_CHANGED,
  UserManagementWorkflowChangedEvent,
} from './events';

@Injectable()
export class UserManagementWorkflowService extends BaseService<UserManagementWorkflow> {
  public constructor(
    private readonly managementWorkflowService: ManagementWorkflowService,
    @InjectRepository(UserManagementWorkflow)
    private readonly userManagementWorkflowRepo: EntityRepository<UserManagementWorkflow>,
    private readonly eventEmitter: EventEmitter2
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

    let userManagementWorkflow: UserManagementWorkflow = await this.findOne(
      { userId },
      { populate: { managementWorkflow: true } }
    );

    let previousWorkflow: ManagementWorkflow;

    if (!userManagementWorkflow) {
      userManagementWorkflow = this.create({
        userId,
        managementWorkflow,
      });
    } else {
      previousWorkflow = userManagementWorkflow.managementWorkflow;
      userManagementWorkflow.managementWorkflow = managementWorkflow;
    }

    await this.persistAndFlush(userManagementWorkflow);
    if (
      previousWorkflow?.key !== userManagementWorkflow.managementWorkflow.key
    ) {
      await this.eventEmitter.emitAsync(
        USER_MANAGEMENT_WORKFLOW_CHANGED,
        new UserManagementWorkflowChangedEvent(
          userId,
          userManagementWorkflow.managementWorkflow,
          previousWorkflow
        )
      );
    }

    return userManagementWorkflow;
  }
}
