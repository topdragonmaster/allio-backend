import { Entity, Enum, Property } from '@mikro-orm/core';
import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Base } from '../shared/base.entity';

@ObjectType()
@Entity()
export class Questionaire extends Base<Questionaire, 'id'> {
  @Field()
  @Property({ unique: true })
  name!: string;

  @Field()
  @Property({ unique: true })
  question!: string;

  @Field(() => QuestionaireCategory)
  @Enum({ items: () => QuestionaireCategory })
  category!: QuestionaireCategory;

  @Field(() => Int)
  @Property()
  order: number;
}

export enum QuestionaireCategory {
  Risk = 'Risk',
  Value = 'Value',
}

registerEnumType(QuestionaireCategory, {
  name: 'QuestionaireCategory',
  description: 'supported questionaire types',
});
