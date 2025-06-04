import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { AuthModule } from './core/auth/auth.module';
import { HealthModule } from './core/health/health.module';
import { RedisModule } from './core/redis/redis.module';
import { DatabaseModule } from './infra/database/database.module';
import { LoggerModule } from './infra/logger/logger.module';
import { ResponseNormalizerModule } from './infra/response-normalizer/response-normalizer.module';
import { CorrelationIdMiddleware } from './infra/shared/middleware/correlation-id.middleware';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    LoggerModule,
    ResponseNormalizerModule,
    HealthModule,
    RedisModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
