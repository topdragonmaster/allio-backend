import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { InvestmentQuestionnaireOption } from '../investment-questionnaire/investmentQuestionnaireOption.entity';
import { EntityRepository } from '@mikro-orm/core';
import { UserInvestmentQuestionnaireAnswer } from '../user-investment-questionnaire/userInvestmentQuestionnaireAnswer.entity';
import { BaseService } from '../shared/base.service';
import { SeedConfig } from './seed.config';

@Injectable()
export class UserQuestionnaireAnswerFactory extends BaseService<UserInvestmentQuestionnaireAnswer> {
  protected readonly logger: Logger;

  public constructor(
    @InjectRepository(InvestmentQuestionnaireOption)
    private readonly investmentQuestionnaireOption: EntityRepository<InvestmentQuestionnaireOption>,
    @InjectRepository(UserInvestmentQuestionnaireAnswer)
    private readonly userQuestionnaireAnswer: EntityRepository<UserInvestmentQuestionnaireAnswer>,
    private readonly seedConfig: SeedConfig
  ) {
    super(userQuestionnaireAnswer);
    this.logger = new Logger(UserQuestionnaireAnswerFactory.name);
  }

  public async create() {
    const option = await this.investmentQuestionnaireOption.findOneOrFail(
      {
        option: 'Beginner',
      },
      {
        populate: {
          questionnaire: true,
        },
      }
    );
    const answer = new UserInvestmentQuestionnaireAnswer();
    if (this.seedConfig.isDev) {
      answer.id = '0c6164bb-d6a5-4dde-b160-712bdc2082ad';
      answer.selectedOption = option;
      answer.userId = this.seedConfig.getUserId();
      answer.questionnaire = option.questionnaire;
    }

    await this.upsert({
      where: { id: answer.id },
      data: answer,
    });
  }
}
