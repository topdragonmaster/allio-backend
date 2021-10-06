import { Migration } from '@mikro-orm/migrations';

export class Migration20211004135351 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "investment_questionnaire" ("id" serial primary key, "active" bool not null default true, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "name" varchar(255) not null, "question" varchar(255) not null, "category" text check ("category" in (\'Risk\', \'Value\')) not null, "order" int4 not null);');
    this.addSql('alter table "investment_questionnaire" add constraint "investment_questionnaire_name_unique" unique ("name");');
    this.addSql('alter table "investment_questionnaire" add constraint "investment_questionnaire_question_unique" unique ("question");');

    this.addSql('create table "investment_questionnaire_option" ("id" serial primary key, "active" bool not null default true, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "questionnaire_id" int4 not null, "option" varchar(255) not null, "description" varchar(255) not null);');
    this.addSql('alter table "investment_questionnaire_option" add constraint "investment_questionnaire_option_option_unique" unique ("option");');
    this.addSql('alter table "investment_questionnaire_option" add constraint "investment_questionnaire_option_description_unique" unique ("description");');

    this.addSql('create table "user_investment_questionnaire_answer" ("id" varchar(255) not null, "active" bool not null default true, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "user_id" uuid not null, "questionnaire_id" int4 not null, "answer" varchar(255) null, "selected_option_id" int4 null);');
    this.addSql('alter table "user_investment_questionnaire_answer" add constraint "user_investment_questionnaire_answer_pkey" primary key ("id");');

    this.addSql('alter table "investment_questionnaire_option" add constraint "investment_questionnaire_option_questionnaire_id_foreign" foreign key ("questionnaire_id") references "investment_questionnaire" ("id") on update cascade;');

    this.addSql('alter table "user_investment_questionnaire_answer" add constraint "user_investment_questionnaire_answer_questionnaire_id_foreign" foreign key ("questionnaire_id") references "investment_questionnaire" ("id") on update cascade;');
    this.addSql('alter table "user_investment_questionnaire_answer" add constraint "user_investment_questionnaire_answer_selected_option_id_foreign" foreign key ("selected_option_id") references "investment_questionnaire_option" ("id") on update cascade on delete set null;');
  }

}
