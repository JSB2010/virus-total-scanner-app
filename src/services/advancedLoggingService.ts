/**
 * DropSentinel Advanced Logging Service
 * Comprehensive logging system with multiple levels, file rotation, and analytics
 */

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  category: string;
  message: string;
  data?: any;
  userId?: string;
  sessionId?: string;
  buildVersion?: string;
  platform?: string;
}

export interface LogAnalytics {
  totalLogs: number;
  errorCount: number;
  warningCount: number;
  criticalCount: number;
  topCategories: Array<{ category: string; count: number }>;
  recentErrors: LogEntry[];
  performanceMetrics: {
    averageResponseTime: number;
    slowestOperations: Array<{ operation: string; duration: number }>;
  };
}

class AdvancedLoggingService {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private sessionId: string;
  private buildVersion: string;
  private platform: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.buildVersion = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
    this.platform = this.detectPlatform();
    
    // Initialize with startup log
    this.info('logging', 'Advanced logging service initialized', {
      sessionId: this.sessionId,
      buildVersion: this.buildVersion,
      platform: this.platform
    });
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private detectPlatform(): string {
    if (typeof window !== 'undefined') {
      return window.navigator.platform;
    }
    return process.platform || 'unknown';
  }

  private createLogEntry(
    level: LogEntry['level'],
    category: string,
    message: string,
    data?: any
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      sessionId: this.sessionId,
      buildVersion: this.buildVersion,
      platform: this.platform
    };
  }

  private addLog(entry: LogEntry): void {
    this.logs.unshift(entry);
    
    // Maintain max logs limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Console output with color coding
    this.outputToConsole(entry);

    // Send to electron main process for file logging
    this.sendToMainProcess(entry);
  }

  private outputToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.category}]`;
    
    switch (entry.level) {
      case 'debug':
        console.debug(`%c${prefix}`, 'color: #6b7280', entry.message, entry.data || '');
        break;
      case 'info':
        console.info(`%c${prefix}`, 'color: #3b82f6', entry.message, entry.data || '');
        break;
      case 'warn':
        console.warn(`%c${prefix}`, 'color: #f59e0b', entry.message, entry.data || '');
        break;
      case 'error':
        console.error(`%c${prefix}`, 'color: #ef4444', entry.message, entry.data || '');
        break;
      case 'critical':
        console.error(`%c${prefix}`, 'color: #dc2626; font-weight: bold', entry.message, entry.data || '');
        break;
    }
  }

  private async sendToMainProcess(entry: LogEntry): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.electronAPI?.logAdvanced) {
        await window.electronAPI.logAdvanced(entry);
      }
    } catch (error) {
      console.error('Failed to send log to main process:', error);
    }
  }

  // Public logging methods
  debug(category: string, message: string, data?: any): void {
    this.addLog(this.createLogEntry('debug', category, message, data));
  }

  info(category: string, message: string, data?: any): void {
    this.addLog(this.createLogEntry('info', category, message, data));
  }

  warn(category: string, message: string, data?: any): void {
    this.addLog(this.createLogEntry('warn', category, message, data));
  }

  error(category: string, message: string, data?: any): void {
    this.addLog(this.createLogEntry('error', category, message, data));
  }

  critical(category: string, message: string, data?: any): void {
    this.addLog(this.createLogEntry('critical', category, message, data));
  }

  // Performance logging
  startTimer(operation: string): () => void {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      this.info('performance', `Operation completed: ${operation}`, {
        operation,
        duration: Math.round(duration),
        unit: 'ms'
      });
    };
  }

  // Analytics and reporting
  getAnalytics(): LogAnalytics {
    const errorLogs = this.logs.filter(log => log.level === 'error');
    const warningLogs = this.logs.filter(log => log.level === 'warn');
    const criticalLogs = this.logs.filter(log => log.level === 'critical');

    // Category analysis
    const categoryCount: Record<string, number> = {};
    this.logs.forEach(log => {
      categoryCount[log.category] = (categoryCount[log.category] || 0) + 1;
    });

    const topCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Performance metrics
    const performanceLogs = this.logs.filter(log => 
      log.category === 'performance' && log.data?.duration
    );
    
    const averageResponseTime = performanceLogs.length > 0
      ? performanceLogs.reduce((sum, log) => sum + log.data.duration, 0) / performanceLogs.length
      : 0;

    const slowestOperations = performanceLogs
      .sort((a, b) => (b.data?.duration || 0) - (a.data?.duration || 0))
      .slice(0, 5)
      .map(log => ({
        operation: log.data?.operation || 'Unknown',
        duration: log.data?.duration || 0
      }));

    return {
      totalLogs: this.logs.length,
      errorCount: errorLogs.length,
      warningCount: warningLogs.length,
      criticalCount: criticalLogs.length,
      topCategories,
      recentErrors: errorLogs.slice(0, 10),
      performanceMetrics: {
        averageResponseTime: Math.round(averageResponseTime),
        slowestOperations
      }
    };
  }

  // Export logs for debugging
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['timestamp', 'level', 'category', 'message', 'sessionId', 'platform'];
      const csvRows = [
        headers.join(','),
        ...this.logs.map(log => [
          log.timestamp,
          log.level,
          log.category,
          `"${log.message.replace(/"/g, '""')}"`,
          log.sessionId,
          log.platform
        ].join(','))
      ];
      return csvRows.join('\n');
    }
    
    return JSON.stringify(this.logs, null, 2);
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
    this.info('logging', 'Log history cleared');
  }

  // Get logs by criteria
  getLogs(criteria?: {
    level?: LogEntry['level'];
    category?: string;
    since?: Date;
    limit?: number;
  }): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (criteria?.level) {
      filteredLogs = filteredLogs.filter(log => log.level === criteria.level);
    }

    if (criteria?.category) {
      filteredLogs = filteredLogs.filter(log => log.category === criteria.category);
    }

    if (criteria?.since) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) >= criteria.since!
      );
    }

    if (criteria?.limit) {
      filteredLogs = filteredLogs.slice(0, criteria.limit);
    }

    return filteredLogs;
  }
}

// Create singleton instance
export const advancedLogger = new AdvancedLoggingService();

// Export for use in components
export default advancedLogger;
