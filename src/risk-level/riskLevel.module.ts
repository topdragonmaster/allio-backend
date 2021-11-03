import { Module } from '@nestjs/common';
import { UserRiskLevelService } from './userRiskLevel.service';
import { RiskLevelResolver } from './riskLevel.resolver';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { RiskLevel } from './entities/riskLevel.entity';
import { UserRiskLevel } from './entities/userRiskLevel.entity';
import { AuthModule } from '../auth/auth.module';
import { RiskLevelService } from './riskLevel.service';
import { UserInvestmentQuestionnaireModule } from '../user-investment-questionnaire/userInvestmentQuestionnaire.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([RiskLevel, UserRiskLevel]),
    AuthModule,
    UserInvestmentQuestionnaireModule,
  ],
  providers: [RiskLevelService, UserRiskLevelService, RiskLevelResolver],
})
export class RiskLevelModule {}
