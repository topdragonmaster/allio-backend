import { Base } from '../../shared/base.entity';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Entity,
  LoadStrategy,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { ManagementWorkflow } from '../../management-workflow/entities/managementWorkflow.entity';

@ObjectType()
@Entity()
export class UserManagementWorkflow extends Base<UserManagementWorkflow, 'id'> {
  @Field(() => ID)
  @PrimaryKey({ type: 'uuid', defaultRaw: 'uuid_generate_v4()' })
  id: string;

  @Field()
  @Property({ type: 'uuid' })
  userId: string;

  @Field(() => ManagementWorkflow)
  @ManyToOne({
    entity: () => ManagementWorkflow,
    strategy: LoadStrategy.JOINED,
  })
  managementWorkflow: ManagementWorkflow;
}
