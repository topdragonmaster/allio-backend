import { Args, Query, Resolver } from '@nestjs/graphql';
import { AssetClass } from '../asset-class/entities/assetClass.entity';
import { GetUserAssetClassListArgs } from './dto/getUserAssetClassList.args';
import { CurrentUser } from '../auth/decorator/currentUser';
import { Action, RequestUserInfo } from '../auth/types';
import { ForbiddenError } from 'apollo-server-core';
import { UserAssetClass } from './entities/userAssetClass.entity';
import { PoliciesGuard } from '../auth/policies.guard';
import { UseGuards } from '@nestjs/common';
import { CaslAbilityFactory } from '../auth/casl-ability.factory';
import { UserAssetClassService } from './userAssetClass.service';

@UseGuards(PoliciesGuard)
@Resolver()
export class UserAssetClassResolver {
  public constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly userAssetClassService: UserAssetClassService
  ) {}

  @Query(() => [AssetClass], { name: 'getUserAssetClassList' })
  public async getUserAssetClassList(
    @Args() args: GetUserAssetClassListArgs,
    @CurrentUser() user: RequestUserInfo
  ): Promise<AssetClass[]> {
    const userId = args.userId || user.uuid;
    const hasAccess = await this.caslAbilityFactory.checkPolicyAccess(
      user,
      userId,
      Action.READ,
      UserAssetClass
    );
    if (!hasAccess) {
      throw new ForbiddenError('Forbidden');
    }

    return this.userAssetClassService.getUserAssetClassList(userId);
  }
}
