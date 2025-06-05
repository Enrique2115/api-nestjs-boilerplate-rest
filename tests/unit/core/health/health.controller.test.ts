import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { Logger } from 'nestjs-pino';

import { HealthController } from '@/src/core/health/health.controller';

import { createMock, Mock } from '@/tests/utils/mock';

describe('HealthController', () => {
  let controller: HealthController;
  let logger: Mock<Logger>;
  let healthCheckService: Mock<HealthCheckService>;
  let typeOrmHealthIndicator: Mock<TypeOrmHealthIndicator>;

  beforeEach(() => {
    logger = createMock<Logger>();
    healthCheckService = createMock<HealthCheckService>();
    typeOrmHealthIndicator = createMock<TypeOrmHealthIndicator>();
    controller = new HealthController(
      logger,
      healthCheckService,
      typeOrmHealthIndicator,
    );
  });

  describe('readiness', () => {
    it('should perform health check', async () => {
      const mockHealthResult = {
        status: 'ok',
        info: { database: { status: 'up' } },
        error: {},
        details: { database: { status: 'up' } },
      };

      healthCheckService.check.mockResolvedValue(mockHealthResult);
      typeOrmHealthIndicator.pingCheck.mockResolvedValue({
        database: { status: 'up' },
      });

      const result = await controller.readiness();

      expect(healthCheckService.check).toHaveBeenCalledWith([
        expect.any(Function),
      ]);
      expect(result).toEqual(mockHealthResult);
    });
  });
});
