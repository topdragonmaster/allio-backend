import { ArgsType, Field } from '@nestjs/graphql';
import { GraphQLString } from 'graphql';

@ArgsType()
export class SetUserQuestionnaireAnswerArgs {
  @Field(() => GraphQLString)
  questionnaireId: string;

  @Field(() => GraphQLString, { nullable: true })
  userId: string;

  @Field(() => GraphQLString, { nullable: true })
  answer: string;

  @Field(() => GraphQLString, { nullable: true })
  selectedOptionId: string;
}
