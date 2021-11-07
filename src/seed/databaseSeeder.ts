import { Injectable } from '@nestjs/common';
import { UserQuestionnaireAnswerFactory } from './userQuestionnaireAnswerFactory';
import { EntityManager } from '@mikro-orm/core';
import { UserManagementWorkflowFactory } from './userManagementWorkflowFactory';
import { UserRiskLevelFactory } from './userRiskLevelFactory';
import { UserRecommendedPortfolioFactory } from './userRecommendedPortfolioFactory';

@Injectable()
export class DatabaseSeeder {
  public constructor(
    private readonly userQuestionnaireAnswerFactory: UserQuestionnaireAnswerFactory,
    private readonly userManagementWorkflowFactory: UserManagementWorkflowFactory,
    private readonly userRiskLevelFactory: UserRiskLevelFactory,
    private readonly userRecommendedPortfolioFactory: UserRecommendedPortfolioFactory,
    private readonly entityManager: EntityManager
  ) {}

  public async run() {
    await this.userQuestionnaireAnswerFactory.create();
    await this.userManagementWorkflowFactory.create();
    await this.userRiskLevelFactory.create();
    await this.userRecommendedPortfolioFactory.create();
    await this.entityManager.flush();
  }
}
