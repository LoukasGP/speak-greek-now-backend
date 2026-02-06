export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger {
  private level: LogLevel;

  constructor(private readonly serviceName: string) {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase() || 'INFO';
    this.level = LogLevel[envLevel as keyof typeof LogLevel] || LogLevel.INFO;
  }

  private log(level: LogLevel, message: string, context?: any): void {
    if (level < this.level) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      service: this.serviceName,
      message,
      ...(context && { context }),
    };

    console.log(JSON.stringify(logEntry));
  }

  debug(message: string, context?: any): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: any): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: any): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: any): void {
    this.log(LogLevel.ERROR, message, {
      ...context,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }),
    });
  }
}
