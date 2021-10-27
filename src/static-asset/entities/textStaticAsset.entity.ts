import { Base } from '../../shared/base.entity';
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { AssetTableName } from './staticAssetAllocation.entity';

@Entity({ tableName: AssetTableName.TextStaticAsset })
export class TextStaticAsset extends Base<TextStaticAsset, 'id'> {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'uuid_generate_v4()' })
  id: string;

  @Property({ unique: true })
  name: string;

  @Property({ default: '' })
  description: string;

  @Property({ default: [] })
  tag: string[];
}
