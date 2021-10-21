import { ArgsType, Field } from '@nestjs/graphql';
import { GraphQLString } from 'graphql';

@ArgsType()
export class GetAssetClassListArgs {
  @Field(() => [GraphQLString], { nullable: true })
  idList: string[];
}
