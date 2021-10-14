import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { UserInvestmentQuestionnaireAnswer } from './userInvestmentQuestionnaireAnswer.entity';
import { UserInvestmentQuestionnaireResolver } from './userInvestmentQuestionnaire.resolver';
import { UserInvestmentQuestionnaireService } from './userInvestmentQuestionnaire.service';
import { AuthModule } from '../auth/auth.module';
import { InvestmentQuestionnaire } from '../investment-questionnaire/investmentQuestionnaire.entity';
import { InvestmentQuestionnaireOption } from '../investment-questionnaire/investmentQuestionnaireOption.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      UserInvestmentQuestionnaireAnswer,
      InvestmentQuestionnaire,
      InvestmentQuestionnaireOption,
    ]),
    AuthModule,
  ],
  providers: [
    UserInvestmentQuestionnaireResolver,
    UserInvestmentQuestionnaireService,
  ],
})
export class UserInvestmentQuestionnaireModule {}
