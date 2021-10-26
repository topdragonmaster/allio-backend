import { ArgsType, Field } from '@nestjs/graphql';
import { ArrayMinSize, ArrayUnique, IsOptional, IsUUID } from 'class-validator';

@ArgsType()
export class SetUserAssetClassListArgs {
  @IsOptional()
  @IsUUID()
  @Field({ nullable: true })
  userId: string = undefined;

  @ArrayUnique()
  @ArrayMinSize(1)
  @IsUUID('all', { each: true })
  @Field(() => [String])
  assetClassIdList: string[] = undefined;
}
