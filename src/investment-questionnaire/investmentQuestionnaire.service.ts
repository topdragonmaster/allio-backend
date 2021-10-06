import { Injectable } from '@nestjs/common';
import {
  InvestmentQuestionnaire,
  InvestmentQuestionnaireCategory,
} from './investmentQuestionnaire.entity';

@Injectable()
export class InvestmentQuestionnaireService {
  async findAll(): Promise<InvestmentQuestionnaire> {
    const investmentQuestionnaire = new InvestmentQuestionnaire();
    investmentQuestionnaire.name = 'question title';
    investmentQuestionnaire.question = 'How are you?';
    investmentQuestionnaire.category = InvestmentQuestionnaireCategory.Risk;
    investmentQuestionnaire.order = 1;
    return investmentQuestionnaire;
  }
}
