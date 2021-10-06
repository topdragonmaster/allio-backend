import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { UserInvestmentQuestionnaireAnswer } from './userInvestmentQuestionnaireAnswer.entity';

@Module({
  imports: [MikroOrmModule.forFeature([UserInvestmentQuestionnaireAnswer])],
  providers: [],
})
export class UserInvestmentQuestionnaireModule {}
