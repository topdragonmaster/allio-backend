import { Injectable } from '@nestjs/common';
import { GetUserQuestionnaireAnswerArgs } from './dto/getUserQuestionnaireAnswer.args';
import { InjectRepository } from '@mikro-orm/nestjs';
import { UserInvestmentQuestionnaireAnswer } from './userInvestmentQuestionnaireAnswer.entity';
import { EntityRepository, QueryOrder } from '@mikro-orm/core';
import { SetUserQuestionnaireAnswerArgs } from './dto/setUserQuestionnaireAnswer.args';
import { InvestmentQuestionnaire } from '../investment-questionnaire/investmentQuestionnaire.entity';
import { InvestmentQuestionnaireOption } from '../investment-questionnaire/investmentQuestionnaireOption.entity';
import { NotFoundError } from '../shared/errors';
import { FilterQuery } from '@mikro-orm/core/typings';

@Injectable()
export class UserInvestmentQuestionnaireService {
  public constructor(
    @InjectRepository(UserInvestmentQuestionnaireAnswer)
    private readonly userQuestionnaireAnswerRepo: EntityRepository<UserInvestmentQuestionnaireAnswer>,
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
      throw new NotFoundError('User not found');
    }

    const filterQuery: FilterQuery<UserInvestmentQuestionnaireAnswer> = {
      userId,
    };

    if (args.questionnaireId) {
      await this.investmentQuestionnaireRepo.findOneOrFail(
        { id: args.questionnaireId },
        { failHandler: (): any => new NotFoundError('Questionnaire not found') }
      );
      filterQuery.questionnaire = args.questionnaireId;
    }

    return this.userQuestionnaireAnswerRepo.find(filterQuery, {
      orderBy: {
        createdAt: QueryOrder.ASC,
      },
    });
  }

  public async setAnswer(
    args: SetUserQuestionnaireAnswerArgs,
    userId: string
  ): Promise<UserInvestmentQuestionnaireAnswer[]> {
    if (!userId) {
      throw new NotFoundError('User not found');
    }

    const { questionnaireId, answer, selectedOptionIdList = [] } = args;
    const questionnaire: InvestmentQuestionnaire =
      await this.investmentQuestionnaireRepo.findOneOrFail(
        { id: questionnaireId },
        { failHandler: (): any => new NotFoundError('Questionnaire not found') }
      );

    const oldUserAnswerList: UserInvestmentQuestionnaireAnswer[] =
      await this.userQuestionnaireAnswerRepo.find({
        userId,
        questionnaire,
      });

    if (answer || selectedOptionIdList.length === 0) {
      const userQuestionnaireAnswer: UserInvestmentQuestionnaireAnswer =
        this.userQuestionnaireAnswerRepo.create({
          answer,
          userId,
          questionnaire,
          selectedOption: null,
        });
      await this.userQuestionnaireAnswerRepo.remove(oldUserAnswerList);
      await this.userQuestionnaireAnswerRepo.persistAndFlush(
        userQuestionnaireAnswer
      );

      return [userQuestionnaireAnswer];
    }

    const questionnaireOptionList: InvestmentQuestionnaireOption[] =
      await this.investmentQuestionnaireOptionRepo.find({
        id: { $in: selectedOptionIdList },
        questionnaire,
      });

    if (questionnaireOptionList.length !== selectedOptionIdList.length) {
      const missingOptionId = selectedOptionIdList.find(
        (id) => !questionnaireOptionList.some((asset) => asset.id === id)
      );
      throw new NotFoundError('Investment questionnaire option not found', {
        investmentQuestionnaireOptionId: missingOptionId,
      });
    }

    await this.userQuestionnaireAnswerRepo.remove(oldUserAnswerList);
    const userAnswerList = questionnaireOptionList.map((selectedOption) =>
      this.userQuestionnaireAnswerRepo.create({
        answer,
        userId,
        questionnaire,
        selectedOption,
      })
    );

    await this.userQuestionnaireAnswerRepo.persistAndFlush(userAnswerList);
    return userAnswerList;
  }
}
