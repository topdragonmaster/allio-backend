import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class GetUserAssetClassListArgs {
  @Field({ nullable: true })
  userId: string;
}
