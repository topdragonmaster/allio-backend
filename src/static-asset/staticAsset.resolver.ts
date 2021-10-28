import { Args, Query, Resolver } from '@nestjs/graphql';
import { GetStaticAssetListArgs } from './dto/getStaticAssetList.args';
import { StaticAssetService } from './staticAsset.service';
import { StaticAssetResponseItem } from './dto/staticAssetResponseItem';

@Resolver()
export class StaticAssetResolver {
  public constructor(private readonly staticAssetService: StaticAssetService) {}

  @Query(() => [StaticAssetResponseItem], { name: 'getStaticAssetList' })
  public async getStaticAssetList(
    @Args() args: GetStaticAssetListArgs
  ): Promise<StaticAssetResponseItem[]> {
    return this.staticAssetService.getStaticAssetList(args);
  }
}
