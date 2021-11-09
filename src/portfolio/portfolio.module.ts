import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { UserRecommendedPortfolio } from './entities/userRecommendedPortfolio.entity';
import { HttpModule } from '@nestjs/axios';
import { OptimizerPortfolioClient } from './optimizerPortfolioClient';
import { UserRecommendedPortfolioService } from './userRecommendedPortfolio.service';
import { PortfolioResolver } from './portfolio.resolver';
import { UserManagementWorkflowModule } from '../user-management-workflow/userManagementWorkflow.module';
import { RiskLevelModule } from '../risk-level/riskLevel.module';
import { InvestmentValueModule } from '../investment-value/investmentValue.module';
import { AuthModule } from '../auth/auth.module';
import { UserAssetClassModule } from '../user-asset-class/userAssetClass.module';
import { UserRecommendedPortfolioListener } from './event-listeners/userRecommendedPortfolio.listener';

@Module({
  imports: [
    MikroOrmModule.forFeature([UserRecommendedPortfolio]),
    HttpModule,
    UserManagementWorkflowModule,
    RiskLevelModule,
    InvestmentValueModule,
    AuthModule,
    UserAssetClassModule,
  ],
  providers: [
    OptimizerPortfolioClient,
    UserRecommendedPortfolioService,
    PortfolioResolver,
    UserRecommendedPortfolioListener,
  ],
  exports: [UserRecommendedPortfolioService],
})
export class PortfolioModule {}
