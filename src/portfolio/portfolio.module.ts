import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { UserRecommendedPortfolio } from './entities/userRecommendedPortfolio.entity';

@Module({
  imports: [MikroOrmModule.forFeature([UserRecommendedPortfolio])],
})
export class PortfolioModule {}
