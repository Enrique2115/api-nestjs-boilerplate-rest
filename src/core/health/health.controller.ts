import { Controller, Get, HttpCode, Inject } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { Logger } from 'nestjs-pino';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    @Inject(Logger) private readonly logger: Logger,
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
  ) {}

  @Get('')
  @HttpCode(200)
  @ApiOperation({ summary: 'Health check' })
  @HealthCheck()
  readiness() {
    return this.health.check([
      async () => this.db.pingCheck('database', { timeout: 300 }),
    ]);
  }
}
