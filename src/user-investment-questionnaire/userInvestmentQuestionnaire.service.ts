import { Injectable } from '@nestjs/common';
import { GetUserQuestionnaireAnswerArgs } from './dto/getUserQuestionnaireAnswer.args';
import { InjectRepository } from '@mikro-orm/nestjs';
import { UserInvestmentQuestionnaireAnswer } from './userInvestmentQuestionnaireAnswer.entity';
import { EntityRepository, QueryOrder } from '@mikro-orm/core';
import { SetUserQuestionnaireAnswerArgs } from './dto/setUserQuestionnaireAnswer.args';
import { InvestmentQuestionnaire } from '../investment-questionnaire/investmentQuestionnaire.entity';
import {
  QuestionnaireNotFound,
  QuestionnaireOptionNotFound,
} from '../investment-questionnaire/utils/errors';
import { InvestmentQuestionnaireOption } from '../investment-questionnaire/investmentQuestionnaireOption.entity';
import { ForbiddenError } from 'apollo-server-core';

@Injectable()
export class UserInvestmentQuestionnaireService {
  public constructor(
    @InjectRepository(UserInvestmentQuestionnaireAnswer)
    private readonly userInvestmentQuestionnaireRepo: EntityRepository<UserInvestmentQuestionnaireAnswer>,
    @InjectRepository(InvestmentQuestionnaire)
    private readonly investmentQuestionnaireRepo: EntityRepository<InvestmentQuestionnaire>,
    @InjectRepository(InvestmentQuestionnaireOption)
    private readonly investmentQuestionnaireOptionRepo: EntityRepository<InvestmentQuestionnaireOption>
  ) {}
  public async getAnswers(
    args: GetUserQuestionnaireAnswerArgs,
    userId: string
  ) {
    if (!userId) {
      throw new ForbiddenError();
    }

    if (args.questionnaireId) {
      await this.investmentQuestionnaireRepo.findOneOrFail(
        { id: args.questionnaireId },
        { failHandler: (): any => new QuestionnaireNotFound() }
      );
    }

    return this.userInvestmentQuestionnaireRepo.find(
      { ...args, userId },
      {
        orderBy: {
          createdAt: QueryOrder.ASC,
        },
      }
    );
  }

  public async setAnswer(
    args: SetUserQuestionnaireAnswerArgs,
    userId: string
  ): Promise<UserInvestmentQuestionnaireAnswer> {
    if (!userId) {
      throw new ForbiddenError();
    }

    const { questionnaireId, answer, selectedOptionId } = args;
    const questionnaire = await this.investmentQuestionnaireRepo.findOneOrFail(
      { id: questionnaireId },
      { failHandler: (): any => new QuestionnaireNotFound() }
    );

    let userAnswer = await this.userInvestmentQuestionnaireRepo.findOne({
      userId,
      questionnaire,
    });

    let selectedOption: InvestmentQuestionnaireOption;
    if (selectedOptionId) {
      selectedOption =
        await this.investmentQuestionnaireOptionRepo.findOneOrFail(
          { id: selectedOptionId, questionnaire },
          { failHandler: (): any => new QuestionnaireOptionNotFound() }
        );
    }

    if (!userAnswer) {
      userAnswer = this.userInvestmentQuestionnaireRepo.create({
        answer,
        userId,
        questionnaire,
        selectedOption,
      });
    } else {
      this.userInvestmentQuestionnaireRepo.assign(userAnswer, {
        answer: args.answer || userAnswer.answer,
        selectedOption: selectedOption || userAnswer.selectedOption,
      });
    }

    await this.userInvestmentQuestionnaireRepo.persistAndFlush(userAnswer);

    return userAnswer;
  }
}
