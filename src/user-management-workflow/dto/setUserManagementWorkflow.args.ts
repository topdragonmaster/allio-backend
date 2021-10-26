import { ArgsType, Field } from '@nestjs/graphql';
import { IsOptional, IsUUID } from 'class-validator';

@ArgsType()
export class SetUserManagementWorkflowArgs {
  @IsOptional()
  @IsUUID()
  @Field({ nullable: true })
  userId: string = undefined;

  @IsUUID()
  @Field()
  managementWorkflowId: string = undefined;
}
