import { ApolloError } from 'apollo-server-core';

export class QuestionnaireNotFound extends ApolloError {
  constructor() {
    super('Questionnaire not found', 'QUESTIONNAIRE_NOT_FOUND');
    Object.defineProperty(this, 'name', { value: this.constructor.name });
  }
}

export class QuestionnaireOptionNotFound extends ApolloError {
  constructor() {
    super('Questionnaire option not found', 'QUESTIONNAIRE_OPTION_NOT_FOUND');
    Object.defineProperty(this, 'name', { value: this.constructor.name });
  }
}
