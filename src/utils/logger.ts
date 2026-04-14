/**
 * Structured logger for Trading 212 MCP Server
 */

type LogLevel = "error" | "warn" | "info" | "debug";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: Record<string, unknown>;
}

class Logger {
  private readonly minLevel: LogLevel;
  private readonly levels: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  };

  constructor(minLevel: LogLevel = "info") {
    this.minLevel = minLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] <= this.levels[this.minLevel];
  }

  private format(entry: LogEntry): string {
    const dataStr = entry.data ? ` ${JSON.stringify(entry.data)}` : "";
    return `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${dataStr}`;
  }

  error(message: string, data?: Record<string, unknown>) {
    if (this.shouldLog("error")) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: "error",
        message,
        data,
      };
      console.error(this.format(entry));
    }
  }

  warn(message: string, data?: Record<string, unknown>) {
    if (this.shouldLog("warn")) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: "warn",
        message,
        data,
      };
      console.warn(this.format(entry));
    }
  }

  info(message: string, data?: Record<string, unknown>) {
    if (this.shouldLog("info")) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: "info",
        message,
        data,
      };
      console.log(this.format(entry));
    }
  }

  debug(message: string, data?: Record<string, unknown>) {
    if (this.shouldLog("debug")) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: "debug",
        message,
        data,
      };
      console.debug(this.format(entry));
    }
  }
}

export const logger = new Logger(
  (process.env.LOG_LEVEL as LogLevel) ||
    (process.env.DEBUG === "true" ? "debug" : "info"),
);
