import { Collection, Entity, Enum, OneToMany, Property } from '@mikro-orm/core';
import { Base } from '../shared/base.entity';
import { UserRole } from './userRole.entity';

@Entity()
export class User extends Base<User, 'uuid'> {
  @Property()
  firstName!: string;

  @Property()
  lastName!: string;

  @Property({ name: 'fullName' })
  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  @Enum({ items: () => UserStatus, lazy: true })
  status!: UserStatus;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  roles = new Collection<UserRole>(this);
}

export enum UserStatus {
  DISABLED,
  ACTIVE,
}
