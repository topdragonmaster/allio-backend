import { AsyncLocalStorage } from 'async_hooks';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { EntityManager, MikroORM } from '@mikro-orm/core';
import { IS_PROD } from './shared/constants';

global['fetch'] = require('node-fetch');

const storage = new AsyncLocalStorage<EntityManager>();

async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter();
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
    {
      logger: IS_PROD ? ['warn', 'error'] : ['debug'],
    }
  );

  const documentConfig = new DocumentBuilder()
    .setTitle('Main Backend')
    .setDescription('Main Backend of Allio')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup('docs', app, document);

  const fastifyInstance = fastifyAdapter.getInstance();
  const orm = app.get(MikroORM);

  fastifyInstance.addHook(
    'preHandler',
    (request: FastifyRequest, reply: FastifyReply, done) => {
      storage.run(orm.em.fork(true, true), done);
    }
  );

  await app.listen(3000);
}
bootstrap();
