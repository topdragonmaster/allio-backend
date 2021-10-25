import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class GetAssetClassListArgs {
  @Field(() => [String], { nullable: true })
  idList: string[];
}
