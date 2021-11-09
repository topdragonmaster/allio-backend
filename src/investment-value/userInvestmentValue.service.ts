import { EntityRepository } from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, Logger } from '@nestjs/common';
import { BaseService } from '../shared/base.service';
import { NotFoundError } from '../shared/errors';
import { UserInvestmentValue } from './entities/userInvestmentValue.entity';
import { InvestmentQuestionnaireCategory } from '../investment-questionnaire/entities/investmentQuestionnaire.entity';
import { UserInvestmentQuestionnaireService } from '../user-investment-questionnaire/userInvestmentQuestionnaire.service';
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
      1: 'SHE',
      2: 'ICLN',
      3: 'PHO',
      4: 'BIBL',
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

    const resultSet = answerOptions.reduce<Set<string>>((set, answer) => {
      const order = answer?.selectedOption?.order;
      const ticker = mapOrderToTicker[order];
      if (ticker !== undefined || ticker !== null) {
        set.add(ticker);
      }
      return set;
    }, new Set());

    return [...resultSet];
  }

  public async setUserInvestmentValueList(
    userId: string,
    investmentValueList: string[]
  ) {
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

    return userInvestmentValueList;
  }
}
