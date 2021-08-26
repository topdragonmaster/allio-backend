import { Migration } from '@mikro-orm/migrations';

export class Migration20210826073506 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user" ("uuid" uuid not null default uuid_generate_v4(), "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "first_name" varchar(255) not null, "last_name" varchar(255) not null);');
    this.addSql('alter table "user" add constraint "user_pkey" primary key ("uuid");');

    this.addSql('create table "user_role" ("uuid" uuid not null default uuid_generate_v4(), "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "user_uuid" uuid not null, "role" text check ("role" in (\'admin\')) not null);');
    this.addSql('alter table "user_role" add constraint "user_role_pkey" primary key ("uuid");');

    this.addSql('alter table "user_role" add constraint "user_role_user_uuid_foreign" foreign key ("user_uuid") references "user" ("uuid") on update cascade;');
  }

}
