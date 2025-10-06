import { RedisClientOptions } from '@keyv/redis';

import { envs } from './envs';

/**
 * Determina si se debe usar TLS basado en el entorno y configuración
 */
const shouldUseTLS = (): boolean => {
  // Si está explícitamente configurado, usar ese valor
  if (typeof envs.REDIS.ENABLE_TLS === 'boolean') {
    return envs.REDIS.ENABLE_TLS;
  }

  // Por defecto, usar TLS en producción
  return envs.NODE_ENV === 'production';
};

/**
 * Genera la URL de conexión con el protocolo correcto
 */
const getRedisUrl = (): string => {
  const protocol = shouldUseTLS() ? 'rediss' : 'redis';
  const auth =
    envs.REDIS.USERNAME && envs.REDIS.PASSWORD
      ? `${envs.REDIS.USERNAME}:${envs.REDIS.PASSWORD}@`
      : '';
  const db = envs.REDIS.DB ? `/${envs.REDIS.DB}` : '';

  return `${protocol}://${auth}${envs.REDIS.HOST}:${envs.REDIS.PORT}${db}`;
};

/**
 * Estrategia de reconexión mejorada
 */
const reconnectStrategy = (retries: number): Error | number => {
  if (retries > envs.REDIS.MAX_RETRIES) {
    return new Error(
      `Redis connection failed after ${envs.REDIS.MAX_RETRIES} retries`,
    );
  }

  // Backoff exponencial con jitter
  const baseDelay = envs.REDIS.RETRY_DELAY_ON_FAILURE;
  const exponentialDelay = Math.min(baseDelay * Math.pow(2, retries), 30_000);
  const jitter = Math.random() * 1000;

  return Math.floor(exponentialDelay + jitter);
};

/**
 * Configuración base del socket
 */
const getSocketConfig = () => {
  const baseConfig = {
    host: envs.REDIS.HOST,
    port: envs.REDIS.PORT,
    reconnectStrategy,
    // connectTimeout: envs.REDIS.CONNECT_TIMEOUT,
    // socketTimeout: envs.REDIS.COMMAND_TIMEOUT,
  };

  if (shouldUseTLS()) {
    return {
      ...baseConfig,
      tls: true as const, // Literal type 'true' requerido por @redis/client
      rejectUnauthorized: envs.REDIS.TLS_REJECT_UNAUTHORIZED,
      // // En desarrollo, permitir certificados auto-firmados si está configurado
      ...(envs.NODE_ENV === 'development' &&
        !envs.REDIS.TLS_REJECT_UNAUTHORIZED && {
          rejectUnauthorized: false,
        }),
    };
  }

  return {
    ...baseConfig,
    tls: false as const, // Literal type 'false' para conexiones sin TLS
  };
};

/**
 * Validación de configuración
 */
const validateRedisConfig = (): void => {
  if (!envs.REDIS.HOST) {
    throw new Error('REDIS_HOST is required');
  }

  if (!envs.REDIS.PORT || envs.REDIS.PORT < 1 || envs.REDIS.PORT > 65_535) {
    throw new Error('REDIS_PORT must be a valid port number');
  }

  if (
    envs.NODE_ENV === 'production' &&
    shouldUseTLS() &&
    (!envs.REDIS.USERNAME || !envs.REDIS.PASSWORD)
  ) {
    console.warn(
      '⚠️  Redis credentials not set for production environment with TLS',
    );
  }

  // Log de configuración en desarrollo
  if (envs.NODE_ENV === 'development') {
    console.log('🔧 Redis Configuration:', {
      host: envs.REDIS.HOST,
      port: envs.REDIS.PORT,
      database: envs.REDIS.DB,
      tls: shouldUseTLS(),
      sockets: getSocketConfig(),
      hasCredentials: !!(envs.REDIS.USERNAME && envs.REDIS.PASSWORD),
    });
  }
};

// Validar configuración al cargar el módulo
validateRedisConfig();

export const redisConfig: RedisClientOptions = {
  url: getRedisUrl(),

  // Credenciales opcionales (solo si están configuradas)
  ...(envs.REDIS.USERNAME && { username: envs.REDIS.USERNAME }),
  ...(envs.REDIS.PASSWORD && { password: envs.REDIS.PASSWORD }),

  // Configuración de la base de datos
  database: envs.REDIS.DB,

  // Configuración del socket
  socket: getSocketConfig(),

  // Configuración de la cola offline
  disableOfflineQueue: !envs.REDIS.ENABLE_OFFLINE_QUEUE,

  // Configuración de timeouts
  commandsQueueMaxLength: envs.REDIS.POOL_SIZE * 10,
};
