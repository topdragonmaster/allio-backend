import { Args, Query, Resolver } from '@nestjs/graphql';
import { UserRiskLevel } from './entities/userRiskLevel.entity';
import { GetUserRiskLevelArgs } from './dto/getUserRiskLevel.args';
import { RiskLevelService } from './riskLevel.service';
import { CaslAbilityFactory } from '../auth/casl-ability.factory';
import { CurrentUser } from '../auth/decorator/currentUser';
import { Action, RequestUserInfo } from '../auth/types';
import { ForbiddenError } from 'apollo-server-core';
import { UseGuards } from '@nestjs/common';
import { PoliciesGuard } from '../auth/policies.guard';

@UseGuards(PoliciesGuard)
@Resolver()
export class RiskLevelResolver {
  public constructor(
    private readonly riskLevelService: RiskLevelService,
    private readonly caslAbilityFactory: CaslAbilityFactory
  ) {}

  @Query(() => UserRiskLevel, { name: 'getUserRiskLevel' })
  async getUserRiskLevel(
    @Args() args: GetUserRiskLevelArgs,
    @CurrentUser() requestUser: RequestUserInfo
  ) {
    const userId = args.userId || requestUser.uuid;
    const hasAccess = await this.caslAbilityFactory.checkPolicyAccess({
      requestUser,
      userId,
      action: Action.READ,
      subject: UserRiskLevel,
    });
    if (!hasAccess) {
      throw new ForbiddenError('Forbidden');
    }

    return this.riskLevelService.getUserRiskLevel(userId);
  }
}
