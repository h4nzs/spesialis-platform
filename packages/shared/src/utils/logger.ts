export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerOptions {
  /** Minimum level yang akan dicetak. Default: 'info' */
  minLevel?: LogLevel;
  /** Prefix untuk setiap log. Default: '[Ahli Panggilan]' */
  prefix?: string;
  /** Jika true, log dengan console.warn/error untuk level warn+error. Default: true */
  useNativeLevels?: boolean;
  /** Custom log handler. Default: menggunakan console */
  handler?: (level: LogLevel, message: string, data?: unknown) => void;
}

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Isomorphic logger yang aman di browser dan server.
 */
export class Logger {
  private minLevel: LogLevel;
  private prefix: string;
  private useNativeLevels: boolean;
  private handler: ((level: LogLevel, message: string, data?: unknown) => void) | undefined;

  constructor(options: LoggerOptions = {}) {
    this.minLevel = options.minLevel ?? 'info';
    this.prefix = options.prefix ?? '[Ahli Panggilan]';
    this.useNativeLevels = options.useNativeLevels ?? true;
    this.handler = options.handler;
  }

  private shouldLog(level: LogLevel): boolean {
    return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[this.minLevel];
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) return;

    if (this.handler) {
      this.handler(level, message, data);
      return;
    }

    const formatted = `${this.prefix} ${message}`;

    if (!this.useNativeLevels) {
      console.log(`[${level.toUpperCase()}]`, formatted, data ?? '');
      return;
    }

    switch (level) {
      case 'debug':
        console.debug(formatted, data ?? '');
        break;
      case 'info':
        console.info(formatted, data ?? '');
        break;
      case 'warn':
        console.warn(formatted, data ?? '');
        break;
      case 'error':
        console.error(formatted, data ?? '');
        break;
    }
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: unknown): void {
    this.log('error', message, data);
  }
}

/**
 * Global default logger instance.
 */
export const logger = new Logger();

/**
 * Buat logger instance baru dengan prefix spesifik.
 *
 * @example
 *   const bookingLogger = createLogger('[Booking]');
 *   bookingLogger.info('Booking created', { id: 'abc' });
 */
export function createLogger(prefix: string, options?: LoggerOptions): Logger {
  return new Logger({ ...options, prefix });
}
