import { Module } from '@nestjs/common';
import { UserAssetClassResolver } from './userAssetClass.resolver';
import { UserAssetClassService } from './userAssetClass.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserAssetClass } from './entities/userAssetClass.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [MikroOrmModule.forFeature([UserAssetClass]), AuthModule],
  providers: [UserAssetClassResolver, UserAssetClassService],
})
export class UserAssetClassModule {}
