export enum LogLevel {
  debug = 'debug',
  info = 'info',
  warn = 'warn',
  error = 'error',
  http = 'http',
  verbose = 'verbose',
}

const allLogLevels: Set<LogLevel> = new Set([
  LogLevel.error,
  LogLevel.warn,
  LogLevel.info,
  LogLevel.http,
  LogLevel.verbose,
  LogLevel.debug,
]);

export function isLogLevel(level: unknown): level is LogLevel {
  return allLogLevels.has(level as LogLevel);
}
