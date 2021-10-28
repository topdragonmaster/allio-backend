import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/base.service';
import { NotFoundError } from '../shared/errors';
import { UserInvestmentValue } from './entities/userInvestmentValue.entity';

@Injectable()
export class UserInvestmentValueService extends BaseService<UserInvestmentValue> {
  constructor(
    @InjectRepository(UserInvestmentValue)
    private readonly userInvestmentValueRepository: EntityRepository<UserInvestmentValue>
  ) {
    super(userInvestmentValueRepository);
  }

  public async getUserInvestmentValue(
    userId: string
  ): Promise<UserInvestmentValue> {
    if (!userId) {
      throw new NotFoundError('User not found');
    }
    const userInvestmentValue: UserInvestmentValue = await this.findOne(
      { userId },
      { populate: { investmentValue: true } }
    );

    if (!userInvestmentValue) {
      throw new NotFoundError('User investment value not found');
    }

    return userInvestmentValue;
  }
}
