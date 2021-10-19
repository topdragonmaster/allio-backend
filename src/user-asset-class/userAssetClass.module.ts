import { Module } from '@nestjs/common';
import { UserAssetClassResolver } from './userAssetClass.resolver';
import { UserAssetClassService } from './userAssetClass.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserAssetClass } from './entities/userAssetClass.entity';

@Module({
  imports: [MikroOrmModule.forFeature([UserAssetClass])],
  providers: [UserAssetClassResolver, UserAssetClassService],
})
export class UserAssetClassModule {}
