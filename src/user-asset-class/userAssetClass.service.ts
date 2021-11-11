import { Injectable } from '@nestjs/common';
import { AssetClass } from '../asset-class/entities/assetClass.entity';
import { QueryOrder } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { UserAssetClass } from './entities/userAssetClass.entity';
import { NotFoundError } from '../shared/errors';
import { SetUserAssetClassListResponse } from './dto/setUserAssetClassList.response';
import { SetUserAssetClassListArgs } from './dto/setUserAssetClassList.args';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { USER_ASSET_CLASS_CHANGED, UserAssetClassChangedEvent } from './events';
import { BaseService } from '../shared/base.service';
import { EntityRepository } from '@mikro-orm/postgresql';
import { AssetClassService } from '../asset-class/assetClass.service';

@Injectable()
export class UserAssetClassService extends BaseService<UserAssetClass> {
  public constructor(
    private readonly assetClassService: AssetClassService,
    @InjectRepository(UserAssetClass)
    private readonly userAssetClassRepo: EntityRepository<UserAssetClass>,
    private readonly eventEmitter: EventEmitter2
  ) {
    super(userAssetClassRepo);
  }

  public async getUserAssetClassList(userId: string): Promise<AssetClass[]> {
    if (!userId) {
      throw new NotFoundError('User not found');
    }

    const userAssetClassList: UserAssetClass[] = await this.find(
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

    const assetClassList = await this.assetClassService.find({
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
      (assetClass) => this.create({ userId, assetClass })
    );

    await this.nativeDelete({ userId });
    await this.persistAndFlush(userAssetClassList);

    await this.eventEmitter.emitAsync(
      USER_ASSET_CLASS_CHANGED,
      new UserAssetClassChangedEvent(userId)
    );

    return new SetUserAssetClassListResponse(userId, assetClassList);
  }

  public async setDefaultAssetClassList(
    userId: string
  ): Promise<UserAssetClass[]> {
    if (!userId) {
      throw new NotFoundError('User not found');
    }

    const assetClassList: AssetClass[] = await this.assetClassService.find({});
    const userAssetClassList: UserAssetClass[] = assetClassList.map(
      (assetClass) =>
        this.create({
          userId,
          assetClass,
        })
    );
    await this.nativeDelete({ userId });
    await this.persistAndFlush(userAssetClassList);

    return userAssetClassList;
  }

  public async cleanUpUserAssetClassList(userId: string): Promise<void> {
    if (!userId) {
      throw new NotFoundError('User not found');
    }

    await this.nativeDelete({ userId });
  }
}
