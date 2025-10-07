import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { HealthModule } from './core/health/health.module';
import { DatabaseModule } from './core/infra/database/database.module';
import { EnviromentModule } from './core/infra/enviroment/enviroment.module';
import { LoggerModule } from './core/infra/logger/logger.module';
import { ResponseNormalizerModule } from './core/infra/response-normalizer/response-normalizer.module';
import { CorrelationIdMiddleware } from './core/infra/shared/middleware/correlation-id.middleware';
import { RedisModule } from './core/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    EnviromentModule,
    DatabaseModule,
    AuthModule,
    LoggerModule,
    ResponseNormalizerModule,
    HealthModule,
    RedisModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('{*splat}');
  }
}
