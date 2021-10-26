import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class SetUserManagementWorkflowArgs {
  @Field({ nullable: true })
  userId: string;

  @Field()
  managementWorkflowId: string;
}
