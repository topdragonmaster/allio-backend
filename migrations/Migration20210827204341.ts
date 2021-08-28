import { Migration } from '@mikro-orm/migrations';

export class Migration20210827204341 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user" ("uuid" uuid not null default uuid_generate_v4(), "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "username" varchar(100) not null, "email" varchar(255) not null, "status" int2 not null);');
    this.addSql('alter table "user" add constraint "user_pkey" primary key ("uuid");');
    this.addSql('alter table "user" add constraint "user_username_unique" unique ("username");');
    this.addSql('alter table "user" add constraint "user_email_unique" unique ("email");');

    this.addSql('create table "user_role" ("uuid" uuid not null default uuid_generate_v4(), "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "user_uuid" uuid not null, "role" text check ("role" in (\'admin\')) not null);');
    this.addSql('alter table "user_role" add constraint "user_role_pkey" primary key ("uuid");');

    this.addSql('alter table "user_role" add constraint "user_role_user_uuid_foreign" foreign key ("user_uuid") references "user" ("uuid") on update cascade;');
  }

}
