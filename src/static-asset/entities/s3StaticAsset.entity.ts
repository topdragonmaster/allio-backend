import { Entity, Enum, PrimaryKey, Property } from '@mikro-orm/core';
import { Base } from '../../shared/base.entity';
import { AssetTableName } from './staticAssetAllocation.entity';

@Entity({ tableName: AssetTableName.S3StaticAsset })
export class S3StaticAsset extends Base<S3StaticAsset, 'id'> {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'uuid_generate_v4()' })
  id: string;

  @Property({ unique: true })
  name: string;

  @Enum({ items: () => S3StaticAssetType })
  type: S3StaticAssetType;

  @Property({ default: '' })
  description: string;

  @Property()
  s3Bucket: string;

  @Property()
  s3Tag: string;

  @Property({ default: '' })
  s3Region: string;

  @Property({ default: [] })
  tag: string[];
}

export enum S3StaticAssetType {
  Image = 'Image',
  Animation = 'Animation',
}
