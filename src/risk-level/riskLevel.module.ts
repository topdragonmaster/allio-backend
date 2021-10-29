import { Module } from '@nestjs/common';
import { UserRiskLevelService } from './userRiskLevel.service';
import { RiskLevelResolver } from './riskLevel.resolver';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { RiskLevel } from './entities/riskLevel.entity';
import { UserRiskLevel } from './entities/userRiskLevel.entity';
import { AuthModule } from '../auth/auth.module';
import { InvestmentQuestionnaire } from '../investment-questionnaire/investmentQuestionnaire.entity';
import { UserInvestmentQuestionnaireAnswer } from '../user-investment-questionnaire/userInvestmentQuestionnaireAnswer.entity';
import { UserInvestmentQuestionnaireService } from '../user-investment-questionnaire/userInvestmentQuestionnaire.service';
import { InvestmentQuestionnaireOption } from '../investment-questionnaire/investmentQuestionnaireOption.entity';
import { RiskLevelService } from './riskLevel.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      RiskLevel,
      UserRiskLevel,
      UserInvestmentQuestionnaireAnswer,
      InvestmentQuestionnaire,
      InvestmentQuestionnaireOption,
    ]),
    AuthModule,
  ],
  providers: [
    RiskLevelService,
    UserRiskLevelService,
    RiskLevelResolver,
    UserInvestmentQuestionnaireService,
  ],
})
export class RiskLevelModule {}
