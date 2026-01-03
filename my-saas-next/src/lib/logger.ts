
import { db } from "@/db";
import { systemLogs, auditLogs } from "@/db/schema";

// Log levels for filtering
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

// Structured log entry
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
  metadata?: Record<string, unknown>;
  teamId?: string;
  userId?: string;
  traceId?: string;
}

// Environment-based log level threshold
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const MIN_LOG_LEVEL = (process.env.LOG_LEVEL as LogLevel) ||
  (process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG');

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[MIN_LOG_LEVEL];
}

function formatLog(entry: LogEntry): string {
  // JSON format for production (structured logs for log aggregators)
  if (process.env.NODE_ENV === 'production') {
    return JSON.stringify(entry);
  }
  // Pretty format for development
  const meta = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : '';
  return `[${entry.timestamp}] [${entry.level}] [${entry.source}]${entry.traceId ? ` [trace:${entry.traceId}]` : ''} ${entry.message}${meta}`;
}

export const Logger = {
  /**
   * Log user actions for compliance and security (Audit Trail)
   */
  async logAudit(
    teamId: string,
    userId: string,
    action: string,
    details?: string,
    metadata?: Record<string, unknown>
  ) {
    try {
      await db.insert(auditLogs).values({
        teamId,
        userId,
        action,
        entity: 'system',
        details,
      } as typeof auditLogs.$inferInsert);
    } catch (e) {
      this.error('Logger', 'Failed to write audit log', { error: String(e) });
    }
  },

  /**
   * Log system events for monitoring, debugging, and observability
   */
  async logSystem(
    level: LogLevel,
    source: string,
    message: string,
    metadata?: Record<string, unknown>,
    teamId?: string,
    userId?: string
  ) {
    if (!shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      source,
      message,
      metadata,
      teamId,
      userId,
    };

    // Console output for runtime logs
    const output = formatLog(entry);
    const logFn = level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.log;
    logFn(output);

    // Persist ERROR and WARN to database (skip for DEBUG/INFO to reduce DB load)
    if (level === 'ERROR' || level === 'WARN') {
      try {
        await db.insert(systemLogs).values({
          level,
          source,
          message,
          metadata: metadata || null,
          teamId,
          userId
        });
      } catch (e) {
        console.error('Failed to persist system log:', e);
      }
    }
  },

  // Convenience methods
  debug(source: string, message: string, metadata?: Record<string, unknown>) {
    return this.logSystem('DEBUG', source, message, metadata);
  },

  info(source: string, message: string, metadata?: Record<string, unknown>) {
    return this.logSystem('INFO', source, message, metadata);
  },

  warn(source: string, message: string, metadata?: Record<string, unknown>, teamId?: string) {
    return this.logSystem('WARN', source, message, metadata, teamId);
  },

  error(source: string, message: string, metadata?: Record<string, unknown>, teamId?: string) {
    return this.logSystem('ERROR', source, message, metadata, teamId);
  },

  /**
   * Create a scoped logger for a specific service/module
   */
  scope(source: string) {
    return {
      debug: (message: string, metadata?: Record<string, unknown>) =>
        Logger.debug(source, message, metadata),
      info: (message: string, metadata?: Record<string, unknown>) =>
        Logger.info(source, message, metadata),
      warn: (message: string, metadata?: Record<string, unknown>, teamId?: string) =>
        Logger.warn(source, message, metadata, teamId),
      error: (message: string, metadata?: Record<string, unknown>, teamId?: string) =>
        Logger.error(source, message, metadata, teamId),
    };
  }
};

// Pre-scoped loggers for common services
export const StripeLogger = Logger.scope('Stripe');
export const AuthLogger = Logger.scope('Auth');
export const BillingLogger = Logger.scope('Billing');
export const AILogger = Logger.scope('AI');
