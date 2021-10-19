import { Injectable } from '@nestjs/common';
import { UserRiskLevel } from './entities/userRiskLevel.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { NotFoundError } from '../shared/errors';

@Injectable()
export class RiskLevelService {
  public constructor(
    @InjectRepository(UserRiskLevel)
    private readonly userRiskLevelRepository: EntityRepository<UserRiskLevel>
  ) {}

  public async getUserRiskLevel(userId: string): Promise<UserRiskLevel> {
    if (!userId) {
      throw new NotFoundError('User not found');
    }
    const userRiskLevel: UserRiskLevel =
      await this.userRiskLevelRepository.findOne(
        { userId },
        {
          populate: {
            riskLevel: true,
          },
        }
      );

    if (!userRiskLevel) {
      throw new NotFoundError('User risk level not found');
    }

    return userRiskLevel;
  }
}
