import { UserRiskLevel } from './entities/userRiskLevel.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { NotFoundError } from '../shared/errors';
import { InvestmentQuestionnaireCategory } from '../investment-questionnaire/investmentQuestionnaire.entity';
import { UserInvestmentQuestionnaireService } from '../user-investment-questionnaire/userInvestmentQuestionnaire.service';
import { Injectable } from '@nestjs/common';
import { ValidationError } from 'apollo-server-core';
import { RiskLevelService } from './riskLevel.service';

@Injectable()
export class UserRiskLevelService {
  public constructor(
    @InjectRepository(UserRiskLevel)
    private readonly userRiskLevelRepository: EntityRepository<UserRiskLevel>,
    private readonly riskLevelService: RiskLevelService,
    private readonly userInvestmentQuestionnaireService: UserInvestmentQuestionnaireService
  ) {}

  public HighestRiskLevel = 4;
  public LowestRiskLevel = 0;

  public async mapInvestmentQuestionToRiskLevel(userId: string) {
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
          userId,
        }
      );
    if (!answerOptions.length) {
      throw new NotFoundError('User answer not found');
    }
    const order = (
      await this.userInvestmentQuestionnaireService.populateUserAnswers(
        answerOptions[0],
        ['selectedOption']
      )
    )?.selectedOption?.order;
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
      userRiskLevel = this.userRiskLevelRepository.create({
        riskLevel: riskLevelRecord,
        userId,
      });
    }

    await this.userRiskLevelRepository.persistAndFlush(userRiskLevel);

    return userRiskLevel;
  }

  public async getUserRiskLevel(userId: string): Promise<UserRiskLevel> {
    if (!userId) {
      throw new NotFoundError('User not found');
    }
    const userRiskLevel: UserRiskLevel =
      await this.userRiskLevelRepository.findOne(
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
