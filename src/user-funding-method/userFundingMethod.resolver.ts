import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { v4 } from 'uuid';
import { CaslAbilityFactory } from '../auth/casl-ability.factory';
import { CurrentUser } from '../auth/decorator/currentUser';
import { PoliciesGuard } from '../auth/policies.guard';
import { Action, RequestUserInfo } from '../auth/types';
import { FundingMethod } from './dto/fundingMethod.input';
import { SetUserFundingMethodResponse } from './dto/setUserFundingMethod.response';
import { FundingFrequency } from './dto/recurringFundingSetting.input';
import { SetUserFundingMethodArgs } from './dto/setUserFundingMethod.args';

@UseGuards(PoliciesGuard)
@Resolver()
export class UserFundingMethodResolver {
  public constructor(private readonly caslAbilityFactory: CaslAbilityFactory) {}

  @Mutation(() => [SetUserFundingMethodResponse], {
    name: 'setUserFundingMethod',
  })
  public async setUserFundingMethod(
    @Args() args: SetUserFundingMethodArgs,
    @CurrentUser() requestUser: RequestUserInfo
  ): Promise<SetUserFundingMethodResponse[]> {
    // const userId = args.userId || requestUser.uuid;
    // await this.caslAbilityFactory.canAccessOrFail({
    //   requestUser,
    //   userId,
    //   action: Action.MODIFY,
    //   subject: {}, // will change to the appropriate table
    //   ForbiddenError,
    // });

    return [
      {
        id: v4(),
        method: args.fundingMethodList?.[0]?.method ?? FundingMethod.Recurring,
        plaidLinkedItem: {
          id: v4(),
          itemId: 'item_12345678',
          institutionName: 'mock institution',
          institutionId: 'ins_12345678',
          accountId: 'account_12345678',
          accountName: 'mock account',
          accountMask: '*****1234',
          accountType: 'mock type',
          accountSubtype: 'mock subType',
          verificationStatus: 'pending_automatic_verification',
        },
        recurringFundingSetting: {
          id: v4(),
          frequency: FundingFrequency.Weekly,
          amount: 7.51,
        },
      },
    ];
  }
}
