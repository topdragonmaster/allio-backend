import { Module } from '@nestjs/common';
import { RiskLevelService } from './riskLevel.service';
import { RiskLevelResolver } from './riskLevel.resolver';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { RiskLevel } from './entities/riskLevel.entity';
import { UserRiskLevel } from './entities/userRiskLevel.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [MikroOrmModule.forFeature([RiskLevel, UserRiskLevel]), AuthModule],
  providers: [RiskLevelService, RiskLevelResolver],
})
export class RiskLevelModule {}
