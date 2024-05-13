import { Controller, Get, HttpCode, Inject } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

@Controller('health')
export class HealthController {
  constructor(@Inject(Logger) private readonly logger: Logger) {}

  @Get('')
  @HttpCode(200)
  run() {
    this.logger.log('Health check OK');
    return {
      status: 'ok',
    };
  }
}
