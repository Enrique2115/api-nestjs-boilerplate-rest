import { RedisClientOptions } from '@keyv/redis';
import { Injectable } from '@nestjs/common';

import { TypedConfigService } from '@/core/infra/enviroment/config.service';

@Injectable()
export class RedisConfigService {
  constructor(private configService: TypedConfigService) {}

  /**
   * Determina si se debe usar TLS basado en el entorno y configuración
   */
  shouldUseTLS(): boolean {
    // Si se especifica explícitamente, usar ese valor
    if (typeof Boolean(this.configService.redis.ENABLE_TLS) === 'boolean') {
      return Boolean(this.configService.redis.ENABLE_TLS);
    }

    // Por defecto, usar TLS en producción
    return this.configService.app.NODE_ENV === 'production';
  }

  /**
   * Genera la URL de conexión con el protocolo correcto
   */
  getRedisUrl(): string {
    const { HOST, PORT, DB, USERNAME, PASSWORD } = this.configService.redis;
    const protocol = this.shouldUseTLS() ? 'rediss' : 'redis';
    const auth = USERNAME && PASSWORD ? `${USERNAME}:${PASSWORD}@` : '';
    const db = DB ? `/${DB}` : '';

    return `${protocol}://${auth}${HOST}:${PORT}${db}`;
  }

  /**
   * Estrategia de reconexión mejorada
   */
  reconnectStrategy(retries: number): Error | number {
    const { MAX_RETRIES, RETRY_DELAY_ON_FAILURE } = this.configService.redis;

    if (retries > MAX_RETRIES) {
      return new Error(`Redis connection failed after ${MAX_RETRIES} retries`);
    }

    // Backoff exponencial con jitter
    const baseDelay = RETRY_DELAY_ON_FAILURE;
    const exponentialDelay = Math.min(baseDelay * Math.pow(2, retries), 30_000);
    const jitter = Math.random() * 1000;

    return Math.floor(exponentialDelay + jitter);
  }

  /**
   * Configuración base del socket
   */
  getSocketConfig() {
    const { HOST, PORT, TLS_REJECT_UNAUTHORIZED } = this.configService.redis;
    const { NODE_ENV } = this.configService.app;
    const baseConfig = {
      host: HOST,
      port: PORT,
      reconnectStrategy: this.reconnectStrategy,
    };

    if (this.shouldUseTLS()) {
      return {
        ...baseConfig,
        tls: true as const, // Literal type 'true' requerido por @redis/client
        rejectUnauthorized: TLS_REJECT_UNAUTHORIZED,
        // En desarrollo, permitir certificados auto-firmados si está configurado
        ...(NODE_ENV === 'development' &&
          !TLS_REJECT_UNAUTHORIZED && {
            rejectUnauthorized: false,
          }),
      };
    }

    return {
      ...baseConfig,
      tls: false as const, // Literal type 'false' para conexiones sin TLS
    };
  }

  getRedisConfig(): RedisClientOptions {
    const { USERNAME, PASSWORD, DB, ENABLE_OFFLINE_QUEUE, POOL_SIZE } =
      this.configService.redis;

    return {
      url: this.getRedisUrl(),
      // Credenciales opcionales (solo si están configuradas)
      ...(USERNAME && { username: USERNAME }),
      ...(PASSWORD && { password: PASSWORD }),
      // Configuración de la base de datos
      database: DB,
      // Configuración del socket
      socket: this.getSocketConfig(),
      // Configuración de la cola offline
      disableOfflineQueue: !ENABLE_OFFLINE_QUEUE,
      // Configuración de timeouts
      commandsQueueMaxLength: POOL_SIZE * 10,
    };
  }
}
