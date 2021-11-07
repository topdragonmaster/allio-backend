import { ArgsType, Field } from '@nestjs/graphql';
import { ArrayMinSize, ArrayUnique, IsOptional, IsUUID } from 'class-validator';
import { MIN_ASSET_CLASS_COUNT } from '../constants';

@ArgsType()
export class SetUserAssetClassListArgs {
  @IsOptional()
  @IsUUID()
  @Field({ nullable: true })
  userId: string = undefined;

  @ArrayUnique()
  @ArrayMinSize(MIN_ASSET_CLASS_COUNT)
  @IsUUID('all', { each: true })
  @Field(() => [String])
  assetClassIdList: string[] = undefined;
}
