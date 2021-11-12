import { Field, Float, InputType, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsNumber } from 'class-validator';

export enum FundingFrequency {
  Weekly = 'Weekly',
  Biweekly = 'Biweekly',
  Monthly = 'Monthly',
}

registerEnumType(FundingFrequency, {
  name: 'FundingFrequency',
  description: 'Supported funding frequencies',
});

@InputType()
export class RecurringFundingSettingInput {
  @IsEnum(FundingFrequency)
  @Field(() => FundingFrequency)
  frequency: FundingFrequency = undefined;

  @IsNumber()
  @Field(() => Float)
  amount: number = undefined;
}
