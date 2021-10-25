import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class SetUserAssetClassListArgs {
  @Field({ nullable: true })
  userId: string;

  @Field(() => [String])
  assetClassIdList: string[];
}
