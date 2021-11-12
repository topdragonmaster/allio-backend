import { ArgsType, Field } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { FundingMethodInput } from './fundingMethod.input';

@ArgsType()
export class SetUserFundingMethodArgs {
  @IsOptional()
  @IsUUID()
  @Field({ nullable: true })
  userId?: string = undefined;

  @ArrayMinSize(1)
  @IsArray()
  @ArrayUnique()
  @ValidateNested({ each: true })
  @Type(() => FundingMethodInput)
  @Field(() => [FundingMethodInput])
  fundingMethodList: FundingMethodInput[] = undefined;
}
