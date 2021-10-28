import 'reflect-metadata';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import loadEnv from './config/loadEnv';
import loadSecret from './config/loadSecret';
import config from './mikro-orm.config';
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
import { AsyncLocalStorage } from 'async_hooks';
import { EntityManager } from '@mikro-orm/core';

export const storage = new AsyncLocalStorage<EntityManager>();

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [loadSecret('secrets'), loadEnv],
      isGlobal: true,
      cache: true,
    }),
    MikroOrmModule.forRoot({
      ...config,
      registerRequestContext: false,
      context: () => storage.getStore(),
    }),
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
  ],
  controllers: [AppController],
  providers: [AppService, CaslAbilityFactory],
})
export class AppModule {}
