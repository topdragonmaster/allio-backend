import { EntityRepository } from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, Logger } from '@nestjs/common';
import { BaseService } from '../shared/base.service';
import { NotFoundError } from '../shared/errors';
import { UserInvestmentValue } from './entities/userInvestmentValue.entity';
import { InvestmentQuestionnaireCategory } from '../investment-questionnaire/investmentQuestionnaire.entity';
import { UserInvestmentQuestionnaireService } from '../user-investment-questionnaire/userInvestmentQuestionnaire.service';
import { ApolloError } from 'apollo-server-core';
import { InvestmentValueService } from './investmentValue.service';

@Injectable()
export class UserInvestmentValueService extends BaseService<UserInvestmentValue> {
  protected readonly logger: Logger;
  constructor(
    @InjectRepository(UserInvestmentValue)
    private readonly userInvestmentValueRepository: EntityRepository<UserInvestmentValue>,
    private readonly investmentValueService: InvestmentValueService,
    private readonly userInvestmentQuestionnaireService: UserInvestmentQuestionnaireService
  ) {
    super(userInvestmentValueRepository);
    this.logger = new Logger(UserInvestmentValue.name);
  }

  public async mapInvestmentQuestionAnswerToInvestmentValue(
    userId: string
  ): Promise<string[]> {
    // Change this mapping too if the questionnaire is changed
    const ValueQuestionnaireCategory = InvestmentQuestionnaireCategory.Value;
    const valueQuestionnaireOrder = 2;
    // TODO: map the correct tickers
    const mapOrderToTicker = {
      0: 'NACP',
      1: 'MAGA',
      2: 'MAGA',
      3: 'MAGA',
      4: 'MAGA',
      5: 'MAGA',
    };
    const answerOptions =
      await this.userInvestmentQuestionnaireService.getAnswersByQuestionnaireFilter(
        {
          where: {
            category: ValueQuestionnaireCategory,
            order: valueQuestionnaireOrder,
          },
          tableAlias: 'uiqa',
          userId,
          joinAndSelectParams: [
            ['uiqa.selectedOption', 'option', undefined, 'innerJoin'],
          ],
        }
      );

    if (!answerOptions.length) {
      // if no answers found, return default MAGA
      return ['MAGA'];
    }

    const resultSet = answerOptions.reduce<Set<string>>((set, answer) => {
      const order = answer?.selectedOption?.order;
      console.log(order);
      const ticker = mapOrderToTicker[order] ?? 'MAGA';
      set.add(ticker);
      return set;
    }, new Set());

    return [...resultSet];
  }

  public async setUserInvestmentValueList(
    userId: string,
    investmentValueList: string[]
  ) {
    if (!investmentValueList.length) {
      throw ApolloError('Bad Request');
    }
    await this.tryRemoveUserInvestmentValue(userId);
    const investmentValueEntityList = await this.investmentValueService.find({
      investmentValue: investmentValueList,
    });
    const userInvestmentValueList = investmentValueEntityList.map(
      (investmentValueEntity) => {
        return this.create({
          userId,
          investmentValue: investmentValueEntity,
        });
      }
    );
    await this.persistAndFlush(userInvestmentValueList);

    return userInvestmentValueList;
  }

  public async tryGetUserInvestmentValueList(userId: string) {
    let userInvestmentValueList: UserInvestmentValue[];

    try {
      const investmentValueList =
        await this.mapInvestmentQuestionAnswerToInvestmentValue(userId);
      userInvestmentValueList = await this.setUserInvestmentValueList(
        userId,
        investmentValueList
      );
    } catch (err) {
      this.logger.debug(err);
    }

    if (!userInvestmentValueList.length) {
      userInvestmentValueList = await this.getUserInvestmentValueList(userId);
    }

    return userInvestmentValueList;
  }

  public async tryRemoveUserInvestmentValue(userId: string) {
    const userInvestmentValueList = await this.find({ userId });
    return await this.delete(userInvestmentValueList);
  }

  public async getUserInvestmentValueList(
    userId: string
  ): Promise<UserInvestmentValue[]> {
    if (!userId) {
      throw new NotFoundError('User not found');
    }
    const userInvestmentValueList: UserInvestmentValue[] = await this.find(
      { userId },
      { populate: { investmentValue: true } }
    );

    if (!userInvestmentValueList.length) {
      throw new NotFoundError('User investment value not found');
    }

    return userInvestmentValueList;
  }
}
