import { Module } from '@nestjs/common';
import { UserQuestionnaireAnswerFactory } from './userQuestionnaireAnswerFactory';
import { DatabaseSeeder } from './databaseSeeder';
import { UserManagementWorkflowFactory } from './userManagementWorkflowFactory';
import {
  loadConfigModule,
  loadMikroOrmModule,
} from '../shared/utils/loadModule';
import { SeedConfig } from './seed.config';
import { UserManagementWorkflowModule } from '../user-management-workflow/userManagementWorkflow.module';
import { ManagementWorkflowModule } from '../management-workflow/managementWorkflow.module';
import { UserInvestmentQuestionnaireModule } from '../user-investment-questionnaire/userInvestmentQuestionnaire.module';
import { InvestmentQuestionnaireModule } from '../investment-questionnaire/investmentQuestionnaire.module';
import { RiskLevelModule } from '../risk-level/riskLevel.module';
import { UserRiskLevelFactory } from './userRiskLevelFactory';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { UserRecommendedPortfolioFactory } from './userRecommendedPortfolioFactory';

@Module({
  imports: [
    loadMikroOrmModule(),
    loadConfigModule(),
    UserManagementWorkflowModule,
    ManagementWorkflowModule,
    UserInvestmentQuestionnaireModule,
    InvestmentQuestionnaireModule,
    RiskLevelModule,
    PortfolioModule,
  ],
  providers: [
    DatabaseSeeder,
    UserQuestionnaireAnswerFactory,
    UserManagementWorkflowFactory,
    UserRiskLevelFactory,
    UserRecommendedPortfolioFactory,
    SeedConfig,
  ],
})
export class SeederModule {}
