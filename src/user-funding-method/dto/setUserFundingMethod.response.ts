import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserPlaidLinkedItemResponse } from '../../user-plaid-linked-item/dto/userPlaidLinkedItem.response';
import { RecurringFundingSettingResponse } from './recurringFundingSetting.response';
import { FundingMethod } from './fundingMethod.input';

@ObjectType()
export class SetUserFundingMethodResponse {
  @Field(() => ID)
  id: string;

  @Field(() => FundingMethod)
  method: FundingMethod;

  @Field(() => UserPlaidLinkedItemResponse)
  plaidLinkedItem: UserPlaidLinkedItemResponse;

  @Field(() => RecurringFundingSettingResponse, { nullable: true })
  recurringFundingSetting: RecurringFundingSettingResponse;

  public constructor({
    method,
    plaidLinkedItem,
    recurringFundingSetting,
  }: {
    method: FundingMethod;
    plaidLinkedItem: UserPlaidLinkedItemResponse;
    recurringFundingSetting?: RecurringFundingSettingResponse;
  }) {
    this.method = method;
    this.plaidLinkedItem = plaidLinkedItem;
    this.recurringFundingSetting = recurringFundingSetting;
  }
}
