import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Entity, Enum, PrimaryKey, Property } from '@mikro-orm/core';
import { Base } from '../../shared/base.entity';

@ObjectType()
@Entity()
export class ManagementWorkflow extends Base<ManagementWorkflow, 'id'> {
  @Field(() => ID)
  @PrimaryKey({ type: 'uuid', defaultRaw: 'uuid_generate_v4()' })
  id: string;

  @Field(() => ManagementWorkflowKey)
  @Enum({ unique: true, items: () => ManagementWorkflowKey })
  key: ManagementWorkflowKey;

  @Field()
  @Property({ columnType: 'text' })
  name: string;

  @Field()
  @Property({ columnType: 'text' })
  description: string;
}

export enum ManagementWorkflowKey {
  Full = 'Full',
  Partial = 'Partial',
  Self = 'Self',
}

registerEnumType(ManagementWorkflowKey, {
  name: 'ManagementWorkflowKey',
  description: 'supported management workflow key',
});
