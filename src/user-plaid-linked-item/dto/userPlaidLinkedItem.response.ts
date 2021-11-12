import { Field, ID, ObjectType } from '@nestjs/graphql';

// TODO: will remove this response dto after the database entity is merged
@ObjectType()
export class UserPlaidLinkedItemResponse {
  @Field(() => ID)
  id: string;

  @Field()
  itemId: string;

  @Field()
  institutionName: string;

  @Field()
  institutionId: string;

  @Field()
  accountId: string;

  @Field()
  accountName: string;

  @Field()
  accountMask: string;

  @Field()
  accountType: string;

  @Field()
  accountSubtype: string;

  @Field({ nullable: true })
  verificationStatus?: string;
}
