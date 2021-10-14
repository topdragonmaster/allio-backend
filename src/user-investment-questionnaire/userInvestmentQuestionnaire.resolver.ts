import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserInvestmentQuestionnaireAnswer } from './userInvestmentQuestionnaireAnswer.entity';
import { UserInvestmentQuestionnaireService } from './userInvestmentQuestionnaire.service';
import { GetUserQuestionnaireAnswerArgs } from './dto/getUserQuestionnaireAnswer.args';
import { UseGuards } from '@nestjs/common';
import { PoliciesGuard } from '../auth/policies.guard';
import { CurrentUser } from '../auth/decorator/currentUser';
import { RequestUserInfo } from '../auth/types';
import { SetUserQuestionnaireAnswerArgs } from './dto/setUserQuestionnaireAnswer.args';

@UseGuards(PoliciesGuard)
@Resolver()
export class UserInvestmentQuestionnaireResolver {
  public constructor(
    private readonly userInvestmentQuestionnaireService: UserInvestmentQuestionnaireService
  ) {}

  @Query(() => [UserInvestmentQuestionnaireAnswer], {
    name: 'getUserInvestmentQuestionnaireAnswers',
  })
  async getUserInvestmentQuestionnaireAnswers(
    @Args() args: GetUserQuestionnaireAnswerArgs,
    @CurrentUser() user: RequestUserInfo
  ): Promise<UserInvestmentQuestionnaireAnswer[]> {
    const userId = args.userId || user.uuid;
    return this.userInvestmentQuestionnaireService.getAnswers(args, userId);
  }

  @Mutation(() => UserInvestmentQuestionnaireAnswer, {
    name: 'setUserInvestmentQuestionnaireAnswer',
  })
  async setUserInvestmentQuestionnaireAnswer(
    @Args() args: SetUserQuestionnaireAnswerArgs,
    @CurrentUser() user: RequestUserInfo
  ): Promise<UserInvestmentQuestionnaireAnswer> {
    const userId = args.userId || user.uuid;
    return this.userInvestmentQuestionnaireService.setAnswer(args, userId);
  }
}
