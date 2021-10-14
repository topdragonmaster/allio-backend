import { ArgsType, Field, ID } from '@nestjs/graphql';

@ArgsType()
export class GetAllQuestionnaireArgs {
  @Field(() => ID, { nullable: true })
  id?: string;
}
