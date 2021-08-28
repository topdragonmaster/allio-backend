import { Collection, Entity, Enum, OneToMany, Property } from '@mikro-orm/core';
import { Base } from '../shared/base.entity';
import { UserRole } from '../user-role/userRole.entity';

@Entity()
export class User extends Base<User, 'uuid'> {
  @Property({ length: 100, unique: true })
  username!: string;

  @Property({ unique: true })
  email!: string;

  @Enum({ items: () => UserStatus, lazy: true })
  status!: UserStatus;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  roles = new Collection<UserRole>(this);
}

export enum UserStatus {
  DISABLED,
  ACTIVE,
}
