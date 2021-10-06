import { Resolver, Query } from '@nestjs/graphql';
import { InvestmentQuestionnaire } from './investmentQuestionnaire.entity';
import { InvestmentQuestionnaireService } from './investmentQuestionnaire.service';

@Resolver()
export class InvestmentQuestionnaireResolver {
  constructor(
    private investmentQuestionnaireService: InvestmentQuestionnaireService
  ) {}

  @Query(() => InvestmentQuestionnaire)
  async findAllQuestionnaire() {
    return this.investmentQuestionnaireService.findAll();
  }
}
