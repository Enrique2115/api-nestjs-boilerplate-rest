import { Controller, Get, HttpCode, Inject } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(@Inject(Logger) private readonly logger: Logger) {}

  @Get('')
  @HttpCode(200)
  @ApiOperation({ summary: 'Health check' })
  run() {
    this.logger.log('Health check OK');
    return {
      status: 'ok',
    };
  }
}
