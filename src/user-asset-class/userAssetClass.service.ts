import { Injectable } from '@nestjs/common';
import { AssetClass } from '../asset-class/entities/assetClass.entity';
import { EntityRepository, QueryOrder } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { UserAssetClass } from './entities/userAssetClass.entity';
import { NotFoundError } from '../shared/errors';

@Injectable()
export class UserAssetClassService {
  public constructor(
    @InjectRepository(UserAssetClass)
    private readonly userAssetClassRepo: EntityRepository<UserAssetClass>
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
}
