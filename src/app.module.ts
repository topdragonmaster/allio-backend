import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import config from './mikro-orm.config';
import { UserRoleModule } from './user-role/userRole.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [MikroOrmModule.forRoot(config), UserModule, UserRoleModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
