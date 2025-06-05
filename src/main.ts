import fastifyCors from '@fastify/cors';
import fastifyCsrfProtection from '@fastify/csrf-protection';
import helmet from '@fastify/helmet';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { API, envs, METHODS, swaggerConfig } from './config';
import { LoggerInterceptor } from './core/infra/logger/logger.interceptor';
import { ErrorResponseNormalizerFilter } from './core/infra/response-normalizer/error-response.filter';
import { SuccessResponseNormalizerInterceptor } from './core/infra/response-normalizer/success-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bufferLogs: true },
  );

  app.useLogger(app.get(Logger));
  // TODO: Update new version @nestjs/pino
  //  Se debe esperar la nueva version de @nestjs/pino para solventar warning unsupported route path
  //  ISSUE REFERENCE: https://github.com/iamolegga/nestjs-pino/issues/2213
  //  PR: https://github.com/iamolegga/nestjs-pino/pull/2283
  app.setGlobalPrefix(API);
  app.register(helmet);
  app.register(fastifyCsrfProtection, { cookieOpts: { signed: true } });
  app.register(fastifyCors, {
    methods: METHODS,
    credentials: true,
    origin: true,
  });

  app.useGlobalFilters(app.get(ErrorResponseNormalizerFilter));
  app.useGlobalInterceptors(
    app.get(LoggerInterceptor),
    app.get(SuccessResponseNormalizerInterceptor),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger Config
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(envs.PORT, envs.HOST);
}

bootstrap().catch(handleError);

function handleError(error: unknown) {
  // eslint-disable-next-line no-console
  console.error(error);
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
}

process.on('uncaughtException', handleError);
