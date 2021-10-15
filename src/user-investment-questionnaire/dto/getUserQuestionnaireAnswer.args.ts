import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class GetUserQuestionnaireAnswerArgs {
  @Field({ nullable: true })
  questionnaireId: string;

  @Field({ nullable: true })
  userId: string;
}
