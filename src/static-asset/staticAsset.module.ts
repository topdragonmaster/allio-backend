import { Module } from '@nestjs/common';
import { StaticAssetResolver } from './staticAsset.resolver';
import { StaticAssetService } from './staticAsset.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { S3StaticAsset } from './entities/s3StaticAsset.entity';
import { TextStaticAsset } from './entities/textStaticAsset.entity';
import { StaticAssetAllocation } from './entities/staticAssetAllocation.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      S3StaticAsset,
      TextStaticAsset,
      StaticAssetAllocation,
    ]),
  ],
  providers: [StaticAssetResolver, StaticAssetService],
})
export class StaticAssetModule {}
