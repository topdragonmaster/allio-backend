import { ArgsType, Field } from '@nestjs/graphql';
import { GraphQLString } from 'graphQL';

@ArgsType()
export class SetUserAssetClassListArgs {
  @Field({ nullable: true })
  userId: string;

  @Field(() => [GraphQLString])
  assetClassIdList: string[];
}
