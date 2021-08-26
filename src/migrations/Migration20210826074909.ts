import { Migration } from '@mikro-orm/migrations';

export class Migration20210826074909 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" add column "status" int2 not null;');

    this.addSql('alter table "user_role" drop constraint if exists "user_role_role_check";');
    this.addSql('alter table "user_role" alter column "role" type text using ("role"::text);');
    this.addSql('alter table "user_role" add constraint "user_role_role_check" check ("role" in (\'admin\'));');
  }

}
