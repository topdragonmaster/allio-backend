import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class GetUserManagementWorkflowArgs {
  @Field({ nullable: true })
  userId: string;
}
