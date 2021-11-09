import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CaslAbilityFactory } from './auth/casl-ability.factory';
import { GraphQLModule } from '@nestjs/graphql';
import { IS_PROD } from './shared/constants';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { join } from 'path';
import { InvestmentQuestionnaireModule } from './investment-questionnaire/investmentQuestionnaire.module';
import { UserInvestmentQuestionnaireModule } from './user-investment-questionnaire/userInvestmentQuestionnaire.module';
import { RiskLevelModule } from './risk-level/riskLevel.module';
import { AssetClassModule } from './asset-class/assetClass.module';
import { UserAssetClassModule } from './user-asset-class/userAssetClass.module';
import { ManagementWorkflowModule } from './management-workflow/managementWorkflow.module';
import { UserManagementWorkflowModule } from './user-management-workflow/userManagementWorkflow.module';
import { StaticAssetModule } from './static-asset/staticAsset.module';
import { InvestmentValueModule } from './investment-value/investmentValue.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import {
  loadConfigModule,
  loadMikroOrmModule,
} from './shared/utils/loadModule';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    loadMikroOrmModule(),
    loadConfigModule(),
    GraphQLModule.forRoot({
      debug: !IS_PROD,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      disableHealthCheck: true,
      autoSchemaFile: join(process.cwd(), 'graphQL/schema.gql'),
      sortSchema: true,
    }),
    AuthModule,
    InvestmentQuestionnaireModule,
    UserInvestmentQuestionnaireModule,
    RiskLevelModule,
    AssetClassModule,
    UserAssetClassModule,
    ManagementWorkflowModule,
    UserManagementWorkflowModule,
    StaticAssetModule,
    InvestmentValueModule,
    PortfolioModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, CaslAbilityFactory],
})
export class AppModule {}
