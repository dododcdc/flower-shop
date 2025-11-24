/**
 * 日志工具
 * 根据环境控制日志输出，生产环境清理控制台日志
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any[];
  timestamp: Date;
  url: string;
  userAgent: string;
}

class Logger {
  private isDev: boolean;
  private logs: LogEntry[] = [];

  constructor() {
    this.isDev = import.meta.env.DEV;

    // 强制在开发环境显示日志
    if (this.isDev) {
      console.log('🔍 Logger initialized - DEV mode detected');
    }
  }

  private createLogEntry(level: LogLevel, message: string, data?: any[]): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };
  }

  private log(level: LogLevel, message: string, ...data: any[]): void {
    const logEntry = this.createLogEntry(level, message, data);

    // 开发环境输出到控制台
    if (this.isDev) {
      const timestamp = logEntry.timestamp.toISOString();
      const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

      switch (level) {
        case 'debug':
          // eslint-disable-next-line no-console
          console.debug(prefix, message, ...data);
          break;
        case 'info':
          // eslint-disable-next-line no-console
          console.info(prefix, message, ...data);
          break;
        case 'warn':
          // eslint-disable-next-line no-console
          console.warn(prefix, message, ...data);
          break;
        case 'error':
          // eslint-disable-next-line no-console
          console.error(prefix, message, ...data);
          break;
      }
    }

    // 存储日志（可用于错误上报）
    this.logs.push(logEntry);

    // 生产环境可以只存储错误日志
    if (level === 'error' && !this.isDev) {
      // 这里可以集成错误监控服务
      // this.sendErrorToMonitoring(logEntry);
    }
  }

  debug(message: string, ...data: any[]): void {
    this.log('debug', message, ...data);
  }

  info(message: string, ...data: any[]): void {
    this.log('info', message, ...data);
  }

  warn(message: string, ...data: any[]): void {
    this.log('warn', message, ...data);
  }

  error(message: string, ...data: any[]): void {
    this.log('error', message, ...data);
  }

  /**
   * 获取所有日志
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * 清理日志
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * 获取错误日志（用于错误上报）
   */
  getErrorLogs(): LogEntry[] {
    return this.logs.filter(log => log.level === 'error');
  }

  /**
   * 发送错误到监控服务
   */
  private sendErrorToMonitoring(logEntry: LogEntry): void {
    // 这里可以实现错误上报逻辑
    // 例如发送到 Sentry、LogRocket 等服务
    try {
      // fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(logEntry)
      // });
    } catch (error) {
      // 静默处理上报失败，避免影响用户体验
    }
  }
}

// 创建单例实例
export const logger = new Logger();

// 导出默认实例
export default logger;