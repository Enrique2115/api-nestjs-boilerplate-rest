import { Logger } from 'nestjs-pino';

import { HealthController } from '@src/core/health/health.controller';

import { createMock, Mock } from '@tests/utils/mock';

describe('HealthController', () => {
  let controller: HealthController;
  let logger: Mock<Logger>;

  beforeEach(() => {
    logger = createMock<Logger>();
    controller = new HealthController(logger);
  });

  describe('run', () => {
    it('should return ok', () => {
      expect(controller.run()).toEqual({ status: 'ok' });
      expect(logger.log).toHaveBeenCalledWith('Health check OK');
    });
  });
});
