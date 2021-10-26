import { ArgsType, Field } from '@nestjs/graphql';
import { ArrayUnique, IsOptional, IsUUID } from 'class-validator';

@ArgsType()
export class GetManagementWorkflowArgs {
  @ArrayUnique()
  @IsUUID('all', { each: true })
  @IsOptional()
  @Field(() => [String], { nullable: true })
  idList: string[] = undefined;
}
