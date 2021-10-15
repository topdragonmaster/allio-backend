import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserInvestmentQuestionnaireAnswer } from './userInvestmentQuestionnaireAnswer.entity';
import { UserInvestmentQuestionnaireService } from './userInvestmentQuestionnaire.service';
import { GetUserQuestionnaireAnswerArgs } from './dto/getUserQuestionnaireAnswer.args';
import { UseGuards } from '@nestjs/common';
import { PoliciesGuard } from '../auth/policies.guard';
import { CurrentUser } from '../auth/decorator/currentUser';
import { Action, RequestUserInfo } from '../auth/types';
import { SetUserQuestionnaireAnswerArgs } from './dto/setUserQuestionnaireAnswer.args';
import { CaslAbilityFactory } from '../auth/casl-ability.factory';
import { ForbiddenError } from 'apollo-server-core';

@UseGuards(PoliciesGuard)
@Resolver()
export class UserInvestmentQuestionnaireResolver {
  public constructor(
    private readonly userInvestmentQuestionnaireService: UserInvestmentQuestionnaireService,
    private readonly caslAbilityFactory: CaslAbilityFactory
  ) {}

  @Query(() => [UserInvestmentQuestionnaireAnswer], {
    name: 'getUserInvestmentQuestionnaireAnswers',
  })
  public async getUserInvestmentQuestionnaireAnswers(
    @Args() args: GetUserQuestionnaireAnswerArgs,
    @CurrentUser() user: RequestUserInfo
  ): Promise<UserInvestmentQuestionnaireAnswer[]> {
    const userId = args.userId || user.uuid;
    const hasAccess = await this.caslAbilityFactory.checkPolicyAccess(
      user,
      userId,
      Action.READ,
      UserInvestmentQuestionnaireAnswer
    );
    if (!hasAccess) {
      throw new ForbiddenError('Forbidden');
    }
    return this.userInvestmentQuestionnaireService.getAnswers(args, userId);
  }

  @Mutation(() => UserInvestmentQuestionnaireAnswer, {
    name: 'setUserInvestmentQuestionnaireAnswer',
  })
  public async setUserInvestmentQuestionnaireAnswer(
    @Args() args: SetUserQuestionnaireAnswerArgs,
    @CurrentUser() user: RequestUserInfo
  ): Promise<UserInvestmentQuestionnaireAnswer> {
    const userId = args.userId || user.uuid;
    const hasAccess = await this.caslAbilityFactory.checkPolicyAccess(
      user,
      userId,
      Action.MODIFY,
      UserInvestmentQuestionnaireAnswer
    );
    if (!hasAccess) {
      throw new ForbiddenError('Forbidden');
    }

    return this.userInvestmentQuestionnaireService.setAnswer(args, userId);
  }
}
