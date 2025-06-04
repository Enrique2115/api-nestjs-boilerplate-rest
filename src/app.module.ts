import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { HealthModule } from './core/health/health.module';
import { LoggerModule } from './core/infra/logger/logger.module';
import { ResponseNormalizerModule } from './core/infra/response-normalizer/response-normalizer.module';
import { CorrelationIdMiddleware } from './core/infra/shared/middleware/correlation-id.middleware';
import { RedisModule } from './core/redis/redis.module';

@Module({
  imports: [LoggerModule, ResponseNormalizerModule, HealthModule, RedisModule],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
