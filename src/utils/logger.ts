export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export enum LogCategory {
  GAME = 'GAME',
  USER = 'USER',
  AUTH = 'AUTH',
  SYSTEM = 'SYSTEM',
  PERFORMANCE = 'PERFORMANCE'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: any;
  userId?: string;
  sessionId: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private sessionId: string;
  private currentLogLevel: LogLevel = LogLevel.INFO;
  private maxLogs: number = 1000;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupErrorHandling();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupErrorHandling(): void {
    // Capturar errores globales
    window.addEventListener('error', (event) => {
      this.error(LogCategory.SYSTEM, 'Global error caught', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack
      });
    });

    // Capturar promesas rechazadas
    window.addEventListener('unhandledrejection', (event) => {
      this.error(LogCategory.SYSTEM, 'Unhandled promise rejection', {
        reason: event.reason
      });
    });
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLogLevel;
  }

  private addLog(level: LogLevel, category: LogCategory, message: string, data?: any, userId?: string): void {
    if (!this.shouldLog(level)) return;

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      userId,
      sessionId: this.sessionId
    };

    this.logs.push(logEntry);

    // Mantener solo los últimos N logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log en consola para desarrollo
    if (process.env.NODE_ENV === 'development') {
      this.logToConsole(logEntry);
    }

    // Enviar logs críticos al servidor (si está configurado)
    if (level >= LogLevel.ERROR) {
      this.sendToServer(logEntry);
    }
  }

  private logToConsole(entry: LogEntry): void {
    const prefix = `[${entry.category}] ${entry.timestamp}`;
    const style = this.getConsoleStyle(entry.level);

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(`%c${prefix}`, style, entry.message, entry.data);
        break;
      case LogLevel.INFO:
        console.info(`%c${prefix}`, style, entry.message, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(`%c${prefix}`, style, entry.message, entry.data);
        break;
      case LogLevel.ERROR:
        console.error(`%c${prefix}`, style, entry.message, entry.data);
        break;
    }
  }

  private getConsoleStyle(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return 'color: #6B7280; font-weight: normal;';
      case LogLevel.INFO:
        return 'color: #3B82F6; font-weight: normal;';
      case LogLevel.WARN:
        return 'color: #F59E0B; font-weight: bold;';
      case LogLevel.ERROR:
        return 'color: #EF4444; font-weight: bold;';
      default:
        return '';
    }
  }

  private async sendToServer(entry: LogEntry): Promise<void> {
    try {
      // Aquí puedes implementar el envío a tu backend/Supabase
      // Por ahora, solo guardamos en localStorage para logs críticos
      const criticalLogs = JSON.parse(localStorage.getItem('critical_logs') || '[]');
      criticalLogs.push(entry);
      
      // Mantener solo los últimos 50 logs críticos
      if (criticalLogs.length > 50) {
        criticalLogs.splice(0, criticalLogs.length - 50);
      }
      
      localStorage.setItem('critical_logs', JSON.stringify(criticalLogs));
    } catch (error) {
      console.error('Failed to save critical log:', error);
    }
  }

  // Métodos públicos para logging
  debug(category: LogCategory, message: string, data?: any, userId?: string): void {
    this.addLog(LogLevel.DEBUG, category, message, data, userId);
  }

  info(category: LogCategory, message: string, data?: any, userId?: string): void {
    this.addLog(LogLevel.INFO, category, message, data, userId);
  }

  warn(category: LogCategory, message: string, data?: any, userId?: string): void {
    this.addLog(LogLevel.WARN, category, message, data, userId);
  }

  error(category: LogCategory, message: string, data?: any, userId?: string): void {
    this.addLog(LogLevel.ERROR, category, message, data, userId);
  }

  // Métodos específicos para eventos del juego
  logGameEvent(event: string, data?: any, userId?: string): void {
    this.info(LogCategory.GAME, `Game event: ${event}`, data, userId);
  }

  logUserAction(action: string, data?: any, userId?: string): void {
    this.info(LogCategory.USER, `User action: ${action}`, data, userId);
  }

  logPerformance(metric: string, value: number, userId?: string): void {
    this.info(LogCategory.PERFORMANCE, `Performance metric: ${metric}`, { value, unit: 'ms' }, userId);
  }

  // Métodos de utilidad
  setLogLevel(level: LogLevel): void {
    this.currentLogLevel = level;
    this.info(LogCategory.SYSTEM, `Log level changed to ${LogLevel[level]}`);
  }

  getLogs(category?: LogCategory, level?: LogLevel): LogEntry[] {
    return this.logs.filter(log => {
      if (category && log.category !== category) return false;
      if (level !== undefined && log.level < level) return false;
      return true;
    });
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  clearLogs(): void {
    const oldCount = this.logs.length;
    this.logs = [];
    this.info(LogCategory.SYSTEM, `Cleared ${oldCount} logs`);
  }

  getSessionId(): string {
    return this.sessionId;
  }
}

// Instancia singleton del logger
export const logger = new Logger();

// Funciones de conveniencia
export const logGameEvent = (event: string, data?: any, userId?: string) => 
  logger.logGameEvent(event, data, userId);

export const logUserAction = (action: string, data?: any, userId?: string) => 
  logger.logUserAction(action, data, userId);

export const logError = (message: string, error?: any, userId?: string) => 
  logger.error(LogCategory.SYSTEM, message, error, userId);

export const logPerformance = (metric: string, value: number, userId?: string) => 
  logger.logPerformance(metric, value, userId);