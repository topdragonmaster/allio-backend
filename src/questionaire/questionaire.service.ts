import { Injectable } from '@nestjs/common';
import { Questionaire, QuestionaireCategory } from './questionaire.entity';

@Injectable()
export class QuestionaireService {
  async findAll(): Promise<Questionaire> {
    const questionaire = new Questionaire();
    questionaire.name = 'question title';
    questionaire.question = 'How are you?';
    questionaire.category = QuestionaireCategory.Risk;
    questionaire.order = 1;
    return questionaire;
  }
}
