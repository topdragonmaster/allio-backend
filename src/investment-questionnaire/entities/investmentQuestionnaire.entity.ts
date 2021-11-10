import {
  Collection,
  Entity,
  Enum,
  LoadStrategy,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Base } from '../../shared/base.entity';
import { InvestmentQuestionnaireOption } from './investmentQuestionnaireOption.entity';

@ObjectType()
@Entity()
export class InvestmentQuestionnaire extends Base<
  InvestmentQuestionnaire,
  'id'
> {
  @Field(() => ID)
  @PrimaryKey({ type: 'uuid', defaultRaw: 'uuid_generate_v4()' })
  id: string;

  @Field()
  @Property({ columnType: 'text', unique: true })
  name!: string;

  @Field()
  @Property({ columnType: 'text', unique: true })
  question!: string;

  @Field(() => InvestmentQuestionnaireCategory)
  @Enum({ items: () => InvestmentQuestionnaireCategory })
  category!: InvestmentQuestionnaireCategory;

  @Field(() => Int)
  @Property()
  order: number;

  @Field(() => [InvestmentQuestionnaireOption])
  @OneToMany({
    entity: () => InvestmentQuestionnaireOption,
    mappedBy: (option) => option.questionnaire,
    strategy: LoadStrategy.JOINED,
  })
  options = new Collection<InvestmentQuestionnaireOption>(this);
}

export enum InvestmentQuestionnaireCategory {
  Risk = 'Risk',
  Value = 'Value',
}

registerEnumType(InvestmentQuestionnaireCategory, {
  name: 'InvestmentQuestionnaireCategory',
  description: 'supported investment questionnaire types',
});
