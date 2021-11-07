import { Injectable } from '@nestjs/common';
import { AssetClass } from '../asset-class/entities/assetClass.entity';
import { EntityRepository, QueryOrder } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { UserAssetClass } from './entities/userAssetClass.entity';
import { NotFoundError } from '../shared/errors';
import { SetUserAssetClassListResponse } from './dto/setUserAssetClassList.response';
import { SetUserAssetClassListArgs } from './dto/setUserAssetClassList.args';
import { UserRecommendedPortfolioService } from '../portfolio/userRecommendedPortfolio.service';
import { CASH_ASSET_CLASS_NAME, MIN_ASSET_CLASS_COUNT } from './constants';
import { UserInputError } from 'apollo-server-core';

@Injectable()
export class UserAssetClassService {
  public constructor(
    @InjectRepository(AssetClass)
    private readonly assetClassRepo: EntityRepository<AssetClass>,
    @InjectRepository(UserAssetClass)
    private readonly userAssetClassRepo: EntityRepository<UserAssetClass>,
    private readonly userRecommendedPortfolioService: UserRecommendedPortfolioService
  ) {}

  public async getUserAssetClassList(userId: string): Promise<AssetClass[]> {
    if (!userId) {
      throw new NotFoundError('User not found');
    }

    const userAssetClassList: UserAssetClass[] =
      await this.userAssetClassRepo.find(
        { userId },
        {
          populate: {
            assetClass: true,
          },
          orderBy: {
            createdAt: QueryOrder.ASC,
          },
        }
      );

    return userAssetClassList.map((userAsset) => userAsset.assetClass);
  }

  public async setUserAssetClassList(
    args: SetUserAssetClassListArgs,
    userId: string
  ): Promise<SetUserAssetClassListResponse> {
    if (!userId) {
      throw new NotFoundError('User not found');
    }
    const { assetClassIdList } = args;

    const assetClassList = await this.assetClassRepo.find({
      id: { $in: assetClassIdList },
    });

    if (assetClassIdList.length !== assetClassList.length) {
      const missingAssetClassId = assetClassIdList.find(
        (id) => !assetClassList.some((asset) => asset.id === id)
      );
      throw new NotFoundError('Asset class not found', {
        assetClassId: missingAssetClassId,
      });
    }

    const assetClassNameList: string[] = [];
    let hasCashAssetClass = false;
    const userAssetClassList: UserAssetClass[] = assetClassList.map(
      (assetClass) => {
        assetClassNameList.push(assetClass.name);
        if (assetClass.name === CASH_ASSET_CLASS_NAME) {
          hasCashAssetClass = true;
        }
        return this.userAssetClassRepo.create({ userId, assetClass });
      }
    );

    if (assetClassList.length <= MIN_ASSET_CLASS_COUNT && hasCashAssetClass) {
      throw new UserInputError(
        `Min ${MIN_ASSET_CLASS_COUNT} asset classes must be passed in addition to cash`
      );
    }

    await this.userRecommendedPortfolioService.setRecommendedPortfolio(
      userId,
      assetClassNameList
    );
    await this.userAssetClassRepo.nativeDelete({ userId });
    await this.userAssetClassRepo.persistAndFlush(userAssetClassList);

    return new SetUserAssetClassListResponse(userId, assetClassList);
  }
}
