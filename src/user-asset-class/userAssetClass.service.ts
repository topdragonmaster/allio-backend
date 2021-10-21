import { Injectable } from '@nestjs/common';
import { AssetClass } from '../asset-class/entities/assetClass.entity';
import { EntityRepository, QueryOrder } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { UserAssetClass } from './entities/userAssetClass.entity';
import { NotFoundError } from '../shared/errors';
import { SetUserInvestmentWorkflowResponse } from './dto/setUserInvestmentWorkflow.response';
import { SetUserInvestmentWorkflowArgs } from './dto/setUserInvestmentWorkflow.args';

@Injectable()
export class UserAssetClassService {
  public constructor(
    @InjectRepository(AssetClass)
    private readonly assetClassRepo: EntityRepository<AssetClass>,
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

  public async setUserInvestmentWorkflow(
    args: SetUserInvestmentWorkflowArgs,
    userId: string
  ): Promise<SetUserInvestmentWorkflowResponse> {
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

    const userAssetClassList: UserAssetClass[] = assetClassList.map(
      (assetClass) => this.userAssetClassRepo.create({ userId, assetClass })
    );

    await this.userAssetClassRepo.nativeDelete({ userId });
    await this.userAssetClassRepo.persistAndFlush(userAssetClassList);

    return new SetUserInvestmentWorkflowResponse(userId, assetClassList);
  }
}
