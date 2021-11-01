import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { InvestmentQuestionnaire } from '../investment-questionnaire/investmentQuestionnaire.entity';
import { InvestmentQuestionnaireOption } from '../investment-questionnaire/investmentQuestionnaireOption.entity';
import { UserInvestmentQuestionnaireService } from '../user-investment-questionnaire/userInvestmentQuestionnaire.service';
import { UserInvestmentQuestionnaireAnswer } from '../user-investment-questionnaire/userInvestmentQuestionnaireAnswer.entity';
import { AuthModule } from '../auth/auth.module';
import { InvestmentValue } from './entities/investmentValue.entity';
import { UserInvestmentValue } from './entities/userInvestmentValue.entity';
import { InvestmentValueResolver } from './investmentValue.resolver';
import { InvestmentValueService } from './investmentValue.service';
import { UserInvestmentValueService } from './userInvestmentValue.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      InvestmentValue,
      UserInvestmentValue,
      UserInvestmentQuestionnaireAnswer,
      InvestmentQuestionnaire,
      InvestmentQuestionnaireOption,
    ]),
    AuthModule,
  ],
  providers: [
    InvestmentValueService,
    UserInvestmentValueService,
    InvestmentValueResolver,
    UserInvestmentQuestionnaireService,
  ],
})
export class InvestmentValueModule {}
