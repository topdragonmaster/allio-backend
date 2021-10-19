import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class GetUserRiskLevelArgs {
  @Field({ nullable: true })
  userId: string;
}
