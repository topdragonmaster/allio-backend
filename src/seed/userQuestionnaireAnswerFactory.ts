import { Injectable, Logger } from '@nestjs/common';
import { UserInvestmentQuestionnaireAnswer } from '../user-investment-questionnaire/entities/userInvestmentQuestionnaireAnswer.entity';
import { SeedConfig } from './seed.config';
import { UserInvestmentQuestionnaireService } from '../user-investment-questionnaire/userInvestmentQuestionnaire.service';
import { InvestmentQuestionnaireOptionService } from '../investment-questionnaire/investmentQuestionnaireOption.service';
import { InvestmentQuestionnaireOption } from '../investment-questionnaire/entities/investmentQuestionnaireOption.entity';

@Injectable()
export class UserQuestionnaireAnswerFactory {
  protected readonly logger: Logger;

  public constructor(
    private readonly investmentQuestionnaireOptionService: InvestmentQuestionnaireOptionService,
    private readonly userQuestionnaireService: UserInvestmentQuestionnaireService,
    private readonly seedConfig: SeedConfig
  ) {
    this.logger = new Logger(UserQuestionnaireAnswerFactory.name);
  }

  public async create() {
    const option: InvestmentQuestionnaireOption =
      await this.investmentQuestionnaireOptionService.findOneOrFail(
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

    await this.userQuestionnaireService.upsert({
      where: { id: answer.id },
      data: answer,
    });
  }
}
