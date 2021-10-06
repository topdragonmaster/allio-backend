import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { InvestmentQuestionnaire } from './investmentQuestionnaire.entity';
import { InvestmentQuestionnaireResolver } from './investmentQuestionnaire.resolver';
import { InvestmentQuestionnaireService } from './investmentQuestionnaire.service';

@Module({
  imports: [MikroOrmModule.forFeature([InvestmentQuestionnaire])],
  providers: [InvestmentQuestionnaireService, InvestmentQuestionnaireResolver],
})
export class InvestmentQuestionnaireModule {}
