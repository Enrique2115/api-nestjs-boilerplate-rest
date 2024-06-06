import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { HealthModule } from './core/health/health.module';
import { MediaModule } from './core/media/media.module';
import { LoggerModule } from './infra/logger/logger.module';
import { ResponseNormalizerModule } from './infra/response-normalizer/response-normalizer.module';
import { CorrelationIdMiddleware } from './infra/shared/middleware/correlation-id.middleware';

@Module({
  imports: [LoggerModule, ResponseNormalizerModule, HealthModule, MediaModule],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
