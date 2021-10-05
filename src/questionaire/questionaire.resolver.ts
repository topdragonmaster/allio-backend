import { Resolver, Query } from '@nestjs/graphql';
import { Questionaire } from './questionaire.entity';
import { QuestionaireService } from './questionaire.service';

@Resolver()
export class QuestionaireResolver {
  constructor(private questionaireService: QuestionaireService) {}

  @Query(() => Questionaire)
  async findAllQuestionaire() {
    return this.questionaireService.findAll();
  }
}
