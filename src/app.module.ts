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
import { CaslAbilityFactory } from './auth/casl-ability.factory';
import { GraphQLModule } from '@nestjs/graphql';
import { IS_PROD } from './shared/constants';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { join } from 'path';
import { QuestionaireModule } from './questionaire/questionaire.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [loadSecret('secrets'), loadEnv],
      isGlobal: true,
      cache: true,
    }),
    MikroOrmModule.forRoot(config),
    GraphQLModule.forRoot({
      debug: !IS_PROD,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      disableHealthCheck: true,
      autoSchemaFile: join(process.cwd(), 'graphQL/schema.gql'),
      sortSchema: true,
    }),
    AuthModule,
    QuestionaireModule,
  ],
  controllers: [AppController],
  providers: [AppService, CaslAbilityFactory],
})
export class AppModule {}
