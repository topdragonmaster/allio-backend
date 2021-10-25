import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class GetManagementWorkflowArgs {
  @Field(() => [String], { nullable: true })
  idList: string[];
}
