import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { InvestmentValue } from './entities/investmentValue.entity';
import { UserInvestmentValue } from './entities/userInvestmentValue.entity';

@Module({
  imports: [MikroOrmModule.forFeature([InvestmentValue, UserInvestmentValue])],
})
export class InvestmentValueModule {}
