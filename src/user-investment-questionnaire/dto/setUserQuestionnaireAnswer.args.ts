import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class SetUserQuestionnaireAnswerArgs {
  @Field()
  questionnaireId: string;

  @Field({ nullable: true })
  userId: string;

  @Field({ nullable: true })
  answer: string;

  @Field({ nullable: true })
  selectedOptionId: string;
}
