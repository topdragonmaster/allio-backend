import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import loadEnv from './config/loadEnv';
import loadSecret from './config/loadSecret';
import config from './mikro-orm.config';
import { UserRoleModule } from './user-role/userRole.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [loadSecret('secrets'), loadEnv],
      isGlobal: true,
      cache: true,
    }),
    MikroOrmModule.forRoot(config),
    UserModule,
    UserRoleModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
