import {
  Collection,
  Entity,
  Enum,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Base } from '../shared/base.entity';
import { InvestmentQuestionnaireOption } from './investmentQuestionnaireOption.entity';

@ObjectType()
@Entity()
export class InvestmentQuestionnaire extends Base<
  InvestmentQuestionnaire,
  'id'
> {
  @Field()
  @PrimaryKey()
  id: number;

  @Field()
  @Property({ unique: true })
  name!: string;

  @Field()
  @Property({ unique: true })
  question!: string;

  @Field(() => InvestmentQuestionnaireCategory)
  @Enum({ items: () => InvestmentQuestionnaireCategory })
  category!: InvestmentQuestionnaireCategory;

  @Field(() => Int)
  @Property()
  order: number;

  @OneToMany(
    () => InvestmentQuestionnaireOption,
    (option) => option.questionnaire
  )
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
