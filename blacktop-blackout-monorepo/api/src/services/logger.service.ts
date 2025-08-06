import { Logger } from '@blacktop-blackout-monorepo/shared-types';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  meta?: any;
  context?: string;
}

export class LoggerService implements Logger {
  private currentLevel: LogLevel;
  private logHistory: LogEntry[] = [];
  private maxHistorySize: number = 1000;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.currentLevel = level;
  }

  debug(message: string, meta?: any): void {
    this.log(LogLevel.DEBUG, message, meta);
  }

  info(message: string, meta?: any): void {
    this.log(LogLevel.INFO, message, meta);
  }

  warn(message: string, meta?: any): void {
    this.log(LogLevel.WARN, message, meta);
  }

  error(message: string, meta?: any): void {
    this.log(LogLevel.ERROR, message, meta);
  }

  private log(level: LogLevel, message: string, meta?: any): void {
    if (level < this.currentLevel) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      meta,
      context: this.getContext()
    };

    // Add to history
    this.addToHistory(logEntry);

    // Output to console
    this.outputToConsole(logEntry);

    // In production, you might want to send to external logging service
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalLogger(logEntry);
    }
  }

  private addToHistory(entry: LogEntry): void {
    this.logHistory.push(entry);
    
    // Maintain history size
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }
  }

  private outputToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const levelString = LogLevel[entry.level].toUpperCase();
    const contextString = entry.context ? `[${entry.context}]` : '';
    
    let output = `${timestamp} ${levelString} ${contextString} ${entry.message}`;
    
    if (entry.meta) {
      output += `\n${JSON.stringify(entry.meta, null, 2)}`;
    }

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(output);
        break;
      case LogLevel.INFO:
        console.info(output);
        break;
      case LogLevel.WARN:
        console.warn(output);
        break;
      case LogLevel.ERROR:
        console.error(output);
        break;
    }
  }

  private getContext(): string {
    // Extract context from call stack if needed
    return 'API';
  }

  private sendToExternalLogger(entry: LogEntry): void {
    // Implementation for external logging service (e.g., Winston, Bunyan, etc.)
    // This could send logs to services like CloudWatch, Datadog, etc.
  }

  public getHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  public getRecentLogs(count: number = 50): LogEntry[] {
    return this.logHistory.slice(-count);
  }

  public setLevel(level: LogLevel): void {
    this.currentLevel = level;
    this.info(`Log level changed to ${LogLevel[level]}`);
  }

  public getLevel(): LogLevel {
    return this.currentLevel;
  }

  public clearHistory(): void {
    this.logHistory = [];
    this.info('Log history cleared');
  }
}