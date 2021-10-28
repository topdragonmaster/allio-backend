import { Injectable } from '@nestjs/common';
import { GetStaticAssetListArgs } from './dto/getStaticAssetList.args';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, QueryOrder } from '@mikro-orm/core';
import { S3StaticAsset } from './entities/s3StaticAsset.entity';
import { TextStaticAsset } from './entities/textStaticAsset.entity';
import {
  AssetTableName,
  StaticAssetAllocation,
} from './entities/staticAssetAllocation.entity';
import { OperatorMap, Query } from '@mikro-orm/core/typings';
import { TypeStaticAsset } from './interfaces/enums';
import { StaticAssetResponseItem } from './dto/staticAssetResponseItem';

@Injectable()
export class StaticAssetService {
  public constructor(
    @InjectRepository(S3StaticAsset)
    private readonly s3StaticAssetRepo: EntityRepository<S3StaticAsset>,
    @InjectRepository(TextStaticAsset)
    private readonly textStaticAssetRepo: EntityRepository<TextStaticAsset>,
    @InjectRepository(StaticAssetAllocation)
    private readonly staticAssetAllocationRepo: EntityRepository<StaticAssetAllocation>
  ) {}

  public async getStaticAssetList(
    args: GetStaticAssetListArgs
  ): Promise<StaticAssetResponseItem[]> {
    const { categoryList, typeList, nameList } = args;
    const hasCategoryFilter = categoryList && categoryList.length > 0;
    const hasTypeFilter = typeList && typeList.length > 0;
    const hasNameFilter = nameList && nameList.length > 0;

    if (!hasCategoryFilter && !hasTypeFilter && !hasNameFilter) {
      return [];
    }

    const operatorMap: OperatorMap<StaticAssetAllocation> = { $and: [] };
    if (hasCategoryFilter) {
      categoryList.forEach((categoryItem) => {
        const filter: Query<StaticAssetAllocation> = {
          category: categoryItem.category,
        };
        if (categoryItem.orderList) {
          filter.order = { $in: categoryItem.orderList };
        }
        operatorMap.$and.push(filter);
      });
    }
    if (hasTypeFilter) {
      const assetTableNameList: AssetTableName[] = [];
      typeList.forEach((typeItem) => {
        if (typeItem === TypeStaticAsset.Text) {
          assetTableNameList.push(AssetTableName.TextStaticAsset);
        } else if (
          typeItem === TypeStaticAsset.Image ||
          typeItem === TypeStaticAsset.Animation
        ) {
          assetTableNameList.push(AssetTableName.S3StaticAsset);
        }
      });
      operatorMap.$and.push({ assetTable: { $in: assetTableNameList } });
    }
    if (hasNameFilter) {
      operatorMap.$and.push({ name: { $in: nameList } });
    }

    const assetAllocationList: StaticAssetAllocation[] =
      await this.staticAssetAllocationRepo.find(
        {
          // for now retrieve only public static assets
          role: '{}',
          ...operatorMap,
        },
        {
          orderBy: {
            category: QueryOrder.ASC,
            order: QueryOrder.ASC,
          },
        }
      );

    if (assetAllocationList.length === 0) {
      return [];
    }

    const s3StaticIdList: string[] = [];
    const textStaticIdList: string[] = [];

    assetAllocationList.forEach((assetAllocation) => {
      if (assetAllocation.assetTable === AssetTableName.S3StaticAsset) {
        s3StaticIdList.push(assetAllocation.assetTableId);
      } else if (
        assetAllocation.assetTable === AssetTableName.TextStaticAsset
      ) {
        textStaticIdList.push(assetAllocation.assetTableId);
      }
    });

    let s3StaticAssetList: S3StaticAsset[] = [];
    let textStaticAssetList: TextStaticAsset[] = [];

    if (s3StaticIdList.length) {
      s3StaticAssetList = await this.s3StaticAssetRepo.find({
        id: { $in: s3StaticIdList },
      });
    }

    if (textStaticIdList.length) {
      textStaticAssetList = await this.textStaticAssetRepo.find({
        id: { $in: textStaticIdList },
      });
    }

    const staticAssetResponseList: StaticAssetResponseItem[] = [];
    assetAllocationList.forEach((assetAllocation) => {
      const staticAsset: S3StaticAsset | TextStaticAsset | undefined =
        assetAllocation.assetTable === AssetTableName.S3StaticAsset
          ? s3StaticAssetList.find(
              (staticAsset) => staticAsset.id === assetAllocation.assetTableId
            )
          : textStaticAssetList.find(
              (staticAsset) => staticAsset.id === assetAllocation.assetTableId
            );
      if (staticAsset) {
        staticAssetResponseList.push(
          new StaticAssetResponseItem(assetAllocation, staticAsset)
        );
      }
    });

    return staticAssetResponseList;
  }
}
