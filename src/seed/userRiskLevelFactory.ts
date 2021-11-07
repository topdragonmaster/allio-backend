import { Injectable, Logger } from '@nestjs/common';
import { UserRiskLevel } from '../risk-level/entities/userRiskLevel.entity';
import { UserRiskLevelService } from '../risk-level/userRiskLevel.service';
import { SeedConfig } from './seed.config';
import { RiskLevelService } from '../risk-level/riskLevel.service';
import { RiskLevel } from '../risk-level/entities/riskLevel.entity';

@Injectable()
export class UserRiskLevelFactory {
  protected readonly logger: Logger;

  public constructor(
    private readonly riskLevelService: RiskLevelService,
    private readonly userRiskLevelService: UserRiskLevelService,
    private readonly seedConfig: SeedConfig
  ) {
    this.logger = new Logger(UserRiskLevelFactory.name);
  }

  public async create() {
    const riskLevel: RiskLevel = await this.riskLevelService.findOneOrFail({
      riskLevel: 4,
    });
    let userRiskLevel: UserRiskLevel;
    if (this.seedConfig.isDev) {
      userRiskLevel = this.userRiskLevelService.create({
        id: '201fcac0-ebd6-40f2-90a9-be57425f5bf8',
        riskLevel,
        userId: this.seedConfig.getUserId(),
      });
    }

    await this.userRiskLevelService.upsert({
      where: { id: userRiskLevel.id },
      data: userRiskLevel,
    });
  }
}
