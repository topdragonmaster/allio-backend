import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Field, ObjectType } from '@nestjs/graphql';
import { Base } from '../shared/base.entity';
import { InvestmentQuestionnaire } from './investmentQuestionnaire.entity';

@ObjectType()
@Entity()
export class InvestmentQuestionnaireOption extends Base<
  InvestmentQuestionnaireOption,
  'id'
> {
  @Field()
  @PrimaryKey()
  id: number;

  @ManyToOne(() => InvestmentQuestionnaire)
  questionnaire: InvestmentQuestionnaire;

  @Field()
  @Property({ unique: true })
  option!: string;

  @Field()
  @Property({ unique: true })
  description!: string;
}
