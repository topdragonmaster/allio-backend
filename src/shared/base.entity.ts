import { Entity, BaseEntity, AnyEntity, Property } from '@mikro-orm/core';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity({ abstract: true })
export abstract class Base<
  T extends AnyEntity<T>,
  PK extends keyof T,
  P extends unknown = unknown
> extends BaseEntity<T, PK, P> {
  @Field()
  @Property({ default: true, name: 'active' })
  active!: boolean;

  @Field()
  @Property()
  createdAt: Date = new Date();

  @Field()
  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
