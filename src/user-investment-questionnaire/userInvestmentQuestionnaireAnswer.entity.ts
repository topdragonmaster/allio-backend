import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Field, ObjectType } from '@nestjs/graphql';
import { InvestmentQuestionnaire } from '../investment-questionnaire/investmentQuestionnaire.entity';
import { InvestmentQuestionnaireOption } from '../investment-questionnaire/investmentQuestionnaireOption.entity';
import { Base } from '../shared/base.entity';

@ObjectType()
@Entity()
export class UserInvestmentQuestionnaireAnswer extends Base<
  UserInvestmentQuestionnaireAnswer,
  'id'
> {
  @Field()
  @PrimaryKey()
  id!: string;

  @Field()
  @Property({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => InvestmentQuestionnaire)
  questionnaire!: InvestmentQuestionnaire;

  @Field()
  @Property({ nullable: true })
  answer?: string;

  @ManyToOne(() => InvestmentQuestionnaireOption, { nullable: true })
  selectedOption?: InvestmentQuestionnaireOption;
}
