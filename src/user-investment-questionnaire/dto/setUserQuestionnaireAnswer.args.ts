import { ArgsType, Field } from '@nestjs/graphql';
import { GraphQLString } from 'graphQL';

@ArgsType()
export class SetUserQuestionnaireAnswerArgs {
  @Field()
  questionnaireId: string;

  @Field({ nullable: true })
  userId: string;

  @Field({ nullable: true })
  answer: string;

  @Field(() => [GraphQLString], { nullable: true })
  selectedOptionIdList: string[];
}
