import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ManagementWorkflow } from '../management-workflow/entities/managementWorkflow.entity';
import { UserManagementWorkflowService } from './userManagementWorkflow.service';
import { UseGuards } from '@nestjs/common';
import { PoliciesGuard } from '../auth/policies.guard';
import { GetUserManagementWorkflowArgs } from './dto/getUserManagementWorkflow.args';
import { CaslAbilityFactory } from '../auth/casl-ability.factory';
import { Action, RequestUserInfo } from '../auth/types';
import { ForbiddenError } from 'apollo-server-core';
import { CurrentUser } from '../auth/decorator/currentUser';
import { UserManagementWorkflow } from './entities/userManagementWorkflow.entity';
import { SetUserManagementWorkflowArgs } from './dto/setUserManagementWorkflow.args';

@UseGuards(PoliciesGuard)
@Resolver()
export class UserManagementWorkflowResolver {
  public constructor(
    private readonly userManagementWorkflowService: UserManagementWorkflowService,
    private readonly caslAbilityFactory: CaslAbilityFactory
  ) {}

  @Query(() => ManagementWorkflow, {
    nullable: true,
    name: 'getUserManagementWorkflow',
  })
  public async getUserManagementWorkflow(
    @Args() args: GetUserManagementWorkflowArgs,
    @CurrentUser() user: RequestUserInfo
  ): Promise<ManagementWorkflow | null> {
    const userId = args.userId || user.uuid;
    const hasAccess = await this.caslAbilityFactory.checkPolicyAccess(
      user,
      userId,
      Action.READ,
      UserManagementWorkflow
    );
    if (!hasAccess) {
      throw new ForbiddenError('Forbidden');
    }

    return this.userManagementWorkflowService.getUserManagementWorkflow(userId);
  }

  @Mutation(() => UserManagementWorkflow, {
    name: 'setUserManagementWorkflow',
  })
  public async setUserManagementWorkflow(
    @Args() args: SetUserManagementWorkflowArgs,
    @CurrentUser() user: RequestUserInfo
  ): Promise<UserManagementWorkflow> {
    const userId = args.userId || user.uuid;
    const hasAccess = await this.caslAbilityFactory.checkPolicyAccess(
      user,
      userId,
      Action.MODIFY,
      UserManagementWorkflow
    );
    if (!hasAccess) {
      throw new ForbiddenError('Forbidden');
    }

    return this.userManagementWorkflowService.setUserManagementWorkflow(
      args,
      userId
    );
  }
}
