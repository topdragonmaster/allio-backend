import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserInvestmentQuestionnaireAnswer } from '../user-investment-questionnaire/userInvestmentQuestionnaireAnswer.entity';
import { UserQuestionnaireAnswerFactory } from './userQuestionnaireAnswerFactory';
import { DatabaseSeeder } from './databaseSeeder';
import { InvestmentQuestionnaireOption } from '../investment-questionnaire/investmentQuestionnaireOption.entity';
import { ManagementWorkflow } from '../management-workflow/entities/managementWorkflow.entity';
import { UserManagementWorkflow } from '../user-management-workflow/entities/userManagementWorkflow.entity';
import { UserManagementWorkflowFactory } from './userManagementWorkflowFactory';
import {
  loadConfigModule,
  loadMikroOrmModule,
} from '../shared/utils/loadModule';
import { SeedConfig } from './seed.config';

@Module({
  imports: [
    loadMikroOrmModule(),
    loadConfigModule(),
    MikroOrmModule.forFeature([
      InvestmentQuestionnaireOption,
      UserInvestmentQuestionnaireAnswer,
      ManagementWorkflow,
      UserManagementWorkflow,
    ]),
  ],
  providers: [
    DatabaseSeeder,
    UserQuestionnaireAnswerFactory,
    UserManagementWorkflowFactory,
    SeedConfig,
  ],
})
export class SeederModule {}
