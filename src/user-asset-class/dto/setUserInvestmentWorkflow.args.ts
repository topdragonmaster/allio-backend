import { ArgsType, Field } from '@nestjs/graphql';
import { GraphQLString } from 'graphQL';

@ArgsType()
export class SetUserInvestmentWorkflowArgs {
  @Field({ nullable: true })
  userId: string;

  @Field(() => [GraphQLString])
  assetClassIdList: string[];
}
