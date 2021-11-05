import { Injectable, Logger } from '@nestjs/common';
import {
  OptimizerResponse,
  PortfolioOptimizerProps,
  OptimizerPortfolioClient,
  PortfolioWorkflow,
} from './optimizerPortfolioClient';
import { BaseService } from '../shared/base.service';
import { UserRecommendedPortfolio } from './entities/userRecommendedPortfolio.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { UserManagementWorkflowService } from '../user-management-workflow/userManagementWorkflow.service';
import { UserRiskLevelService } from '../risk-level/userRiskLevel.service';
import { UserRiskLevel } from '../risk-level/entities/userRiskLevel.entity';
import {
  ManagementWorkflow,
  ManagementWorkflowKey,
} from '../management-workflow/entities/managementWorkflow.entity';
import { UserInvestmentValueService } from '../investment-value/userInvestmentValue.service';
import { BadRequestError, NotFoundError } from '../shared/errors';

@Injectable()
export class UserRecommendedPortfolioService extends BaseService<UserRecommendedPortfolio> {
  protected readonly logger: Logger;
  public constructor(
    private readonly optimizerPortfolioClient: OptimizerPortfolioClient,
    @InjectRepository(UserRecommendedPortfolio)
    private readonly userRecommendedPortfolioRepo: EntityRepository<UserRecommendedPortfolio>,
    private readonly userManagementWorkflowService: UserManagementWorkflowService,
    private readonly userRiskLevelService: UserRiskLevelService,
    private readonly userInvestmentValueService: UserInvestmentValueService
  ) {
    super(userRecommendedPortfolioRepo);
    this.logger = new Logger(UserRecommendedPortfolio.name);
  }

  public async setRecommendedPortfolio(
    userId: string,
    assetClassNameList: string[]
  ) {
    if (!userId) {
      throw new NotFoundError('User not found');
    }

    const managementWorkflow: ManagementWorkflow =
      await this.userManagementWorkflowService.getUserManagementWorkflow(
        userId,
        true
      );

    const userRiskLevel: UserRiskLevel =
      await this.userRiskLevelService.getUserRiskLevel(userId);

    const props: PortfolioOptimizerProps = {
      workflow: managementWorkflow.key.toLowerCase() as PortfolioWorkflow,
      risk_tolerance: userRiskLevel.riskLevel.riskLevel,
    };

    if (managementWorkflow.key === ManagementWorkflowKey.Partial) {
      props.groups = assetClassNameList;
    }

    const { portfolio, error }: OptimizerResponse =
      await this.optimizerPortfolioClient.optimizePortfolio(props);

    if (!portfolio.assets || !portfolio.weights) {
      this.logger.error(
        error && error.length ? error : 'Unknown portfolio optimizer exception'
      );
      throw new BadRequestError('Portfolio optimization failed');
    }

    const userRecommendedPortfolioList: UserRecommendedPortfolio[] =
      portfolio.assets.map((asset, idx) =>
        this.create({
          userId,
          asset,
          weight: portfolio.weights[idx],
        })
      );

    const recommendedPortfolioList: UserRecommendedPortfolio[] =
      await this.find({ userId });
    await this.delete(recommendedPortfolioList);
    await this.persistAndFlush(userRecommendedPortfolioList);
  }
}
