import { UserRiskLevel } from './entities/userRiskLevel.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { NotFoundError } from '../shared/errors';
import { InvestmentQuestionnaireCategory } from '../investment-questionnaire/entities/investmentQuestionnaire.entity';
import { UserInvestmentQuestionnaireService } from '../user-investment-questionnaire/userInvestmentQuestionnaire.service';
import { Injectable, Logger } from '@nestjs/common';
import { ValidationError } from 'apollo-server-core';
import { RiskLevelService } from './riskLevel.service';
import { BaseService } from '../shared/base.service';

@Injectable()
export class UserRiskLevelService extends BaseService<UserRiskLevel> {
  protected logger: Logger;
  public constructor(
    @InjectRepository(UserRiskLevel)
    private readonly userRiskLevelRepository: EntityRepository<UserRiskLevel>,
    private readonly riskLevelService: RiskLevelService,
    private readonly userInvestmentQuestionnaireService: UserInvestmentQuestionnaireService
  ) {
    super(userRiskLevelRepository);
    this.logger = new Logger(UserRiskLevelService.name);
  }

  public HighestRiskLevel = 4;
  public LowestRiskLevel = 0;

  public async mapInvestmentQuestionAnswerToRiskLevel(userId: string) {
    // Change this mapping too if the questionnaire is changed
    const RiskQuestionnaireCategory = InvestmentQuestionnaireCategory.Risk;
    const RiskQuestionnaireOrder = 1;
    const answerOptions =
      await this.userInvestmentQuestionnaireService.getAnswersByQuestionnaireFilter(
        {
          where: {
            category: RiskQuestionnaireCategory,
            order: RiskQuestionnaireOrder,
          },
          tableAlias: 'uiqa',
          userId,
          joinAndSelectParams: [
            ['uiqa.selectedOption', 'option', undefined, 'innerJoin'],
          ],
        }
      );
    if (!answerOptions.length) {
      throw new NotFoundError('User answer not found');
    }
    const order = await answerOptions[0]?.selectedOption?.order;
    if (!order) {
      throw new NotFoundError('User answer not found');
    }
    return this.HighestRiskLevel - order;
  }

  public async setUserRiskLevel(userId: string, riskLevel: number) {
    if (riskLevel > this.HighestRiskLevel || riskLevel < this.LowestRiskLevel) {
      throw new ValidationError(
        `Risk level must be >= ${this.LowestRiskLevel} and <= ${this.HighestRiskLevel}`
      );
    }

    let userRiskLevel: UserRiskLevel;
    try {
      userRiskLevel = await this.getUserRiskLevel(userId);
    } catch {}

    const riskLevelRecord = await this.riskLevelService.findOne({ riskLevel });

    if (userRiskLevel) {
      userRiskLevel.riskLevel = riskLevelRecord;
    } else {
      userRiskLevel = this.create({
        riskLevel: riskLevelRecord,
        userId,
      });
    }

    await this.persistAndFlush(userRiskLevel);

    return userRiskLevel;
  }

  public async tryGetUserRiskLevel(userId: string): Promise<UserRiskLevel> {
    let userRiskLevel: UserRiskLevel;

    try {
      const riskLevel = await this.mapInvestmentQuestionAnswerToRiskLevel(
        userId
      );
      userRiskLevel = await this.setUserRiskLevel(userId, riskLevel);
    } catch (err) {
      this.logger.debug(err);
    }
    if (!userRiskLevel) {
      userRiskLevel = await this.getUserRiskLevel(userId);
    }

    return userRiskLevel;
  }

  public async getUserRiskLevel(userId: string): Promise<UserRiskLevel> {
    if (!userId) {
      throw new NotFoundError('User not found');
    }
    const userRiskLevel: UserRiskLevel = await this.findOne(
      { userId },
      {
        populate: {
          riskLevel: true,
        },
      }
    );

    if (!userRiskLevel) {
      throw new NotFoundError('User risk level not found');
    }

    return userRiskLevel;
  }
}
