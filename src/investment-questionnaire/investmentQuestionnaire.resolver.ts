import { Resolver, Query, Args } from '@nestjs/graphql';
import { InvestmentQuestionnaire } from './investmentQuestionnaire.entity';
import { InvestmentQuestionnaireService } from './investmentQuestionnaire.service';
import { GetAllQuestionnaireArgs } from './dto/getAllQuestionnaire.args';

@Resolver()
export class InvestmentQuestionnaireResolver {
  constructor(
    private investmentQuestionnaireService: InvestmentQuestionnaireService
  ) {}

  @Query(() => [InvestmentQuestionnaire], { name: 'getAllQuestionnaire' })
  async getAllQuestionnaire(@Args() args: GetAllQuestionnaireArgs) {
    return this.investmentQuestionnaireService.findAllOrSpecificQuestionnaire(
      args
    );
  }
}
