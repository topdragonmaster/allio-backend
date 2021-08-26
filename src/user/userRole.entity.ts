import { Entity, Enum, ManyToOne } from '@mikro-orm/core';
import { Base } from '../shared/base.entity';
import { User } from './user.entity';

@Entity()
export class UserRole extends Base<UserRole, 'uuid'> {
  @ManyToOne(() => User)
  user!: User;

  @Enum(() => UserRoleType)
  role!: UserRoleType;
}

export enum UserRoleType {
  ADMIN = 'admin',
}
