
import { db } from '@/db';
import { systemLogs } from '@/db/schema';
import type { SystemLogMetadata } from '@/types/log-types';

type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
type LogSource = 'API' | 'DATABASE' | 'MIGRATION' | 'AI' | 'AUTH' | 'BILLING' | 'SYSTEM';

interface LogEntry {
  level: LogLevel;
  source: LogSource;
  message: string;
  metadata?: SystemLogMetadata;
  teamId?: string;
  userId?: string;
}

export class SystemLogService {
  /**
   * Log an entry to the database
   */
  static async log(entry: LogEntry) {
    try {
      const timestamp = new Date().toISOString();
      const prefix = `[${timestamp}] [${entry.level}] [${entry.source}]`;

      if (entry.level === 'ERROR') {
        console.error(prefix, entry.message, entry.metadata || '');
      } else if (entry.level === 'WARN') {
        console.warn(prefix, entry.message, entry.metadata || '');
      } else {
        console.log(prefix, entry.message, entry.metadata || '');
      }

      // Store in database
      await db.insert(systemLogs).values({
        level: entry.level,
        source: entry.source,
        message: entry.message,
        metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
        teamId: entry.teamId,
        userId: entry.userId,
      });

    } catch (error) {
      // Fallback to console if DB fails
      console.error('SystemLog failed:', entry, error);
    }
  }

  /**
   * Log an error
   */
  static error(source: LogSource, message: string, metadata?: SystemLogMetadata) {
    return this.log({ level: 'ERROR', source, message, metadata });
  }

  /**
   * Log a warning
   */
  static warn(source: LogSource, message: string, metadata?: SystemLogMetadata) {
    return this.log({ level: 'WARN', source, message, metadata });
  }

  /**
   * Log info
   */
  static info(source: LogSource, message: string, metadata?: SystemLogMetadata) {
    return this.log({ level: 'INFO', source, message, metadata });
  }

  /**
   * Log API errors with request context
   */
  static apiError(endpoint: string, error: Error, userId?: string, teamId?: string) {
    return this.error('API', `${endpoint} failed: ${error.message}`, {
      stack: error.stack,
      userId,
      teamId,
    });
  }

  /**
   * Log AI service errors
   */
  static aiError(action: string, error: Error, teamId?: string) {
    return this.error('AI', `AI ${action} failed: ${error.message}`, {
      stack: error.stack,
      teamId,
    });
  }

  /**
   * Log migration events
   */
  static migrationEvent(teamId: string, status: 'STARTED' | 'COMPLETED' | 'FAILED', details?: SystemLogMetadata) {
    const level = status === 'FAILED' ? 'ERROR' : 'INFO';
    return this.log({
      level,
      source: 'MIGRATION',
      message: `Migration ${status.toLowerCase()} for team`,
      metadata: { teamId, status, ...details },
      teamId,
    });
  }

  /**
   * Log billing events
   */
  static billingEvent(teamId: string, action: string, details?: SystemLogMetadata) {
    return this.info('BILLING', `Billing action: ${action}`, { teamId, ...details });
  }

  /**
   * Log authentication events
   */
  static authEvent(action: string, userId: string, success: boolean, details?: SystemLogMetadata) {
    return this.log({
      level: success ? 'INFO' : 'WARN',
      source: 'AUTH',
      message: `Auth ${action}: ${success ? 'success' : 'failed'}`,
      metadata: { userId, ...details },
      userId,
    });
  }
}
