import {
  EntityManager,
  EntityRepository,
  FilterQuery,
  Populate,
} from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { User, UserStatus } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly em: EntityManager
  ) {}

  async findAll() {
    return this.userRepository.findAll();
  }

  async findBy(criteria: Partial<User>, populate?: Populate<User>) {
    const { status = UserStatus.ACTIVE } = criteria;
    const where = {
      ...criteria,
      status,
    } as FilterQuery<User>;
    return this.userRepository.findOne(where, populate);
  }

  async findActiveUserByIdentity(identity: string, populate?: Populate<User>) {
    const criteria: Partial<User> = {};
    if (identity.includes('@')) {
      criteria.email = identity;
    } else {
      criteria.username = identity;
    }
    return this.findBy(criteria, populate);
  }
}
