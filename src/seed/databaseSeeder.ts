import { Injectable } from '@nestjs/common';
import { UserQuestionnaireAnswerFactory } from './userQuestionnaireAnswerFactory';
import { EntityManager } from '@mikro-orm/core';
import { UserManagementWorkflowFactory } from './userManagementWorkflowFactory';

@Injectable()
export class DatabaseSeeder {
  public constructor(
    private readonly userQuestionnaireAnswerFactory: UserQuestionnaireAnswerFactory,
    private readonly userManagementWorkflowFactory: UserManagementWorkflowFactory,
    private readonly entityManager: EntityManager
  ) {}

  public async run() {
    await this.userQuestionnaireAnswerFactory.create();
    await this.userManagementWorkflowFactory.create();
    await this.entityManager.flush();
  }
}
