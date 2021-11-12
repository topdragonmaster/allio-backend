import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { FundingFrequency } from './recurringFundingSetting.input';

@ObjectType()
export class RecurringFundingSettingResponse {
  //TODO: will remove this dto when recurring_funding_setting entity is defined
  @Field(() => ID)
  id: string;

  @Field(() => FundingFrequency)
  frequency: FundingFrequency;

  @Field(() => Float)
  amount: number;

  @Field({ nullable: true })
  lastTransactionId?: string;

  @Field({ nullable: true })
  transactionStartDate?: Date;
}
