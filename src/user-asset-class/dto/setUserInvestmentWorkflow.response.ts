import { Field, ObjectType } from '@nestjs/graphql';
import { AssetClass } from '../../asset-class/entities/assetClass.entity';

@ObjectType()
export class SetUserInvestmentWorkflowResponse {
  @Field({ nullable: true })
  userId: string;

  @Field(() => [AssetClass], { nullable: true })
  assetClassList: AssetClass[];

  public constructor(userId: string, assetClassList: AssetClass[]) {
    this.userId = userId;
    this.assetClassList = assetClassList;
  }
}
