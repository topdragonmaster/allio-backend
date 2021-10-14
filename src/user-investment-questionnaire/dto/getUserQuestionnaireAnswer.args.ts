import { ArgsType, Field } from '@nestjs/graphql';
import { GraphQLString } from 'graphql';

@ArgsType()
export class GetUserQuestionnaireAnswerArgs {
  @Field(() => GraphQLString, { nullable: true })
  questionnaireId: string;

  @Field(() => GraphQLString, { nullable: true })
  userId: string;
}
