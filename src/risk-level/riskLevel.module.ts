import { Module } from '@nestjs/common';
import { RiskLevelService } from './riskLevel.service';
import { RiskLevelResolver } from './riskLevel.resolver';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { RiskLevel } from './entities/riskLevel.entity';
import { UserRiskLevel } from './entities/userRiskLevel.entity';

@Module({
  imports: [MikroOrmModule.forFeature([RiskLevel, UserRiskLevel])],
  providers: [RiskLevelService, RiskLevelResolver],
})
export class RiskLevelModule {}
