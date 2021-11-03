import { Injectable } from '@nestjs/common';
import { GetUserQuestionnaireAnswerArgs } from './dto/getUserQuestionnaireAnswer.args';
import { InjectRepository } from '@mikro-orm/nestjs';
import { UserInvestmentQuestionnaireAnswer } from './entities/userInvestmentQuestionnaireAnswer.entity';
import { QueryOrder, MikroORM } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/postgresql';
import { SetUserQuestionnaireAnswerArgs } from './dto/setUserQuestionnaireAnswer.args';
import { InvestmentQuestionnaire } from '../investment-questionnaire/entities/investmentQuestionnaire.entity';
import { InvestmentQuestionnaireOption } from '../investment-questionnaire/entities/investmentQuestionnaireOption.entity';
import { NotFoundError } from '../shared/errors';
import { FilterQuery, Populate, Loaded } from '@mikro-orm/core/typings';
import { QuestionnaireNotFound } from '../investment-questionnaire/utils/errors';
import {
  PostgreSqlDriver,
  EntityManager,
  QueryBuilder,
} from '@mikro-orm/postgresql';
import { BaseService } from '../shared/base.service';
import { InvestmentQuestionnaireService } from '../investment-questionnaire/investmentQuestionnaire.service';
import { InvestmentQuestionnaireOptionService } from '../investment-questionnaire/investmentQuestionnaireOption.service';

@Injectable()
export class UserInvestmentQuestionnaireService extends BaseService<UserInvestmentQuestionnaireAnswer> {
  private readonly em: EntityManager;
  public constructor(
    @InjectRepository(UserInvestmentQuestionnaireAnswer)
    private readonly userQuestionnaireAnswerRepo: EntityRepository<UserInvestmentQuestionnaireAnswer>,
    private readonly investmentQuestionnaireService: InvestmentQuestionnaireService,
    private readonly investmentQuestionnaireOptionService: InvestmentQuestionnaireOptionService,
    private readonly orm: MikroORM<PostgreSqlDriver>
  ) {
    super(userQuestionnaireAnswerRepo);
    this.em = this.orm.em;
  }

  public async getAnswers(
    args: GetUserQuestionnaireAnswerArgs,
    userId: string
  ) {
    let where: FilterQuery<InvestmentQuestionnaire> = undefined;
    if (args.questionnaireId) {
      where = { id: args.questionnaireId };
    }

    return await this.getAnswersByQuestionnaireFilter({
      where,
      userId,
    });
  }

  public async getAnswersByQuestionnaireFilter({
    where,
    userId,
    selectParam,
    joinAndSelectParams,
    tableAlias,
  }: {
    where?: FilterQuery<InvestmentQuestionnaire>;
    tableAlias?: string;
    selectParam?: Parameters<QueryBuilder['select']>;
    userId: string;
    joinAndSelectParams?: Parameters<QueryBuilder['joinAndSelect']>[];
  }) {
    if (!userId) {
      throw new NotFoundError('User not found');
    }

    let qb = this.em
      .createQueryBuilder(UserInvestmentQuestionnaireAnswer, tableAlias)
      .select(selectParam || '*')
      .where({
        ...(where ? { questionnaire: where } : {}),
        userId: userId,
      })
      .orderBy({ createdAt: QueryOrder.ASC });
    if (joinAndSelectParams) {
      joinAndSelectParams.forEach((joinAndSelectParam) => {
        qb = qb.joinAndSelect(...joinAndSelectParam);
      });
    }

    return await qb.getResult();
  }

  populateUserAnswers<
    T = UserInvestmentQuestionnaireAnswer,
    P extends string | keyof T | Populate<T> = Populate<T>
  >(answers: T, populate: P): Promise<Loaded<T, P>>;
  populateUserAnswers<
    T = UserInvestmentQuestionnaireAnswer,
    P extends string | keyof T | Populate<T> = Populate<T>
  >(answers: T[], populate: P): Promise<Loaded<T[], P>>;
  public async populateUserAnswers<
    T = UserInvestmentQuestionnaireAnswer,
    P extends string | keyof T | Populate<T> = Populate<T>
  >(answers: T | T[], populate: P): Promise<Loaded<T | T[], P>> {
    return await this.em.populate(answers, populate);
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
      await this.investmentQuestionnaireService.findOneOrFail(
        { id: questionnaireId },
        { failHandler: (): any => new QuestionnaireNotFound() }
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
      await this.investmentQuestionnaireOptionService.find({
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
