import {
  Entity,
  PrimaryKey,
  BaseEntity,
  AnyEntity,
  Property,
} from '@mikro-orm/core';

@Entity({ abstract: true })
export abstract class Base<
  T extends AnyEntity<T>,
  PK extends keyof T,
  P extends unknown = unknown
> extends BaseEntity<T, PK, P> {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'uuid_generate_v4()' })
  uuid: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
