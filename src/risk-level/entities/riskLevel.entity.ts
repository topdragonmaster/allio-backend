import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { UserRiskLevel } from './userRiskLevel.entity';
import { Base } from '../../shared/base.entity';

@ObjectType()
@Entity()
export class RiskLevel extends Base<RiskLevel, 'id'> {
  @Field(() => ID)
  @PrimaryKey({ type: 'uuid', defaultRaw: 'uuid_generate_v4()' })
  id: string;

  @Field(() => Int)
  @Property()
  riskLevel: number;

  @Field()
  @Property()
  description: string;

  @OneToMany(() => UserRiskLevel, (userRiskLevel) => userRiskLevel.riskLevel)
  userRiskLevels = new Collection<UserRiskLevel>(this);
}
