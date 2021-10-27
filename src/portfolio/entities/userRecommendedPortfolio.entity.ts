import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { Base } from '../../shared/base.entity';

@ObjectType()
@Entity()
export class UserRecommendedPortfolio extends Base<
  UserRecommendedPortfolio,
  'id'
> {
  @Field(() => ID)
  @PrimaryKey({ type: 'uuid', defaultRaw: 'uuid_generate_v4()' })
  id: string;

  @Field()
  @Property({ type: 'uuid' })
  userId: string;

  @Field()
  @Property({ length: 50 })
  asset: string;

  @Field()
  @Property()
  weight: number;
}
