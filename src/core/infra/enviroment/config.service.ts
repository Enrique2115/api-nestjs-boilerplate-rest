import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TypedConfigService {
  constructor(private configService: ConfigService) {}

  get app() {
    return {
      PORT: this.configService.get<number>('app.PORT'),
      HOST: this.configService.get<string>('app.HOST'),
      NODE_ENV: this.configService.get<string>('app.NODE_ENV'),
    };
  }

  get redis() {
    const nodeEnv = this.configService.get<string>('app.NODE_ENV');
    return {
      HOST: this.configService.get<string>('redis.HOST'),
      PORT: this.configService.get<number>('redis.PORT'),
      USERNAME: this.configService.get<string>('redis.USERNAME'),
      PASSWORD: this.configService.get<string>('redis.PASSWORD'),
      DB: this.configService.get<number>('redis.DB', 0),
      CONNECT_TIMEOUT: this.configService.get<number>(
        'redis.CONNECT_TIMEOUT',
        10_000,
      ),
      COMMAND_TIMEOUT: this.configService.get<number>(
        'redis.COMMAND_TIMEOUT',
        5000,
      ),
      RETRY_DELAY_ON_FAILURE: this.configService.get<number>(
        'redis.RETRY_DELAY_ON_FAILURE',
        100,
      ),
      MAX_RETRIES: this.configService.get<number>('redis.MAX_RETRIES', 3),
      ENABLE_TLS: this.configService.get<boolean>(
        'redis.ENABLE_TLS',
        nodeEnv === 'production',
      ),
      TLS_REJECT_UNAUTHORIZED: this.configService.get<boolean>(
        'redis.TLS_REJECT_UNAUTHORIZED',
        true,
      ),
      POOL_SIZE: this.configService.get<number>('redis.POOL_SIZE', 10),
      ENABLE_OFFLINE_QUEUE: this.configService.get<boolean>(
        'redis.ENABLE_OFFLINE_QUEUE',
        true,
      ),
    };
  }

  get database() {
    return {
      TYPE: this.configService.get<string>('database.TYPE'),
      URL: this.configService.get<string>('database.URL'),
    };
  }

  get jwt() {
    return {
      SECRET: this.configService.get<string>('jwt.SECRET'),
      EXPIRES_IN: this.configService.get<string>('jwt.EXPIRES_IN'),
    };
  }
}
