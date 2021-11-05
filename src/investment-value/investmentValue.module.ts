import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { InvestmentValue } from './entities/investmentValue.entity';
import { UserInvestmentValue } from './entities/userInvestmentValue.entity';
import { InvestmentValueResolver } from './investmentValue.resolver';
import { InvestmentValueService } from './investmentValue.service';
import { UserInvestmentValueService } from './userInvestmentValue.service';
import { UserInvestmentQuestionnaireModule } from '../user-investment-questionnaire/userInvestmentQuestionnaire.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([InvestmentValue, UserInvestmentValue]),
    AuthModule,
    UserInvestmentQuestionnaireModule,
  ],
  providers: [
    InvestmentValueService,
    UserInvestmentValueService,
    InvestmentValueResolver,
  ],
  exports: [UserInvestmentValueService],
})
export class InvestmentValueModule {}
