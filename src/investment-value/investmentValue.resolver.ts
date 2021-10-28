import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { ForbiddenError } from 'apollo-server-core';
import { CaslAbilityFactory } from '../auth/casl-ability.factory';
import { CurrentUser } from '../auth/decorator/currentUser';
import { PoliciesGuard } from '../auth/policies.guard';
import { Action, RequestUserInfo } from '../auth/types';
import { GetUserInvestmentValueArgs } from './dto/getInvestmentValue.args';
import { UserInvestmentValue } from './entities/userInvestmentValue.entity';
import { UserInvestmentValueService } from './userInvestmentValue.service';

@UseGuards(PoliciesGuard)
@Resolver()
export class InvestmentValueResolver {
  public constructor(
    private readonly userInvestmentValueService: UserInvestmentValueService,
    private readonly caslAbilityFactory: CaslAbilityFactory
  ) {}

  @Query(() => UserInvestmentValue, { name: 'getUserInvestmentValue' })
  async getUserInvestmentValue(
    @Args() args: GetUserInvestmentValueArgs,
    @CurrentUser() requestUser: RequestUserInfo
  ) {
    const userId = args.userId || requestUser.uuid;
    const hasAccess = await this.caslAbilityFactory.checkPolicyAccess({
      requestUser,
      userId,
      action: Action.READ,
      subject: UserInvestmentValue,
    });

    if (!hasAccess) {
      throw new ForbiddenError('Forbidden');
    }

    return this.userInvestmentValueService.getUserInvestmentValue(userId);
  }
}
