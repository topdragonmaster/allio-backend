import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Questionaire } from './questionaire.entity';
import { QuestionaireResolver } from './questionaire.resolver';
import { QuestionaireService } from './questionaire.service';

@Module({
  imports: [MikroOrmModule.forFeature([Questionaire])],
  providers: [QuestionaireService, QuestionaireResolver],
})
export class QuestionaireModule {}
