export interface LogContext {
  [key: string]: unknown;
}

function redactSensitiveData(data: LogContext): LogContext {
  const redacted: LogContext = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes("password") ||
      lowerKey.includes("token") ||
      lowerKey.includes("secret") ||
      lowerKey.includes("key") ||
      lowerKey.includes("auth")
    ) {
      redacted[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      redacted[key] = redactSensitiveData(value as LogContext);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

export const logger = {
  info(message: string, context?: LogContext) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: "INFO",
      service: "@stive/browse-worker",
      message,
      ...(context ? redactSensitiveData(context) : {}),
    };
    console.log(JSON.stringify(logEntry));
  },

  warn(message: string, context?: LogContext) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: "WARN",
      service: "@stive/browse-worker",
      message,
      ...(context ? redactSensitiveData(context) : {}),
    };
    console.warn(JSON.stringify(logEntry));
  },

  error(message: string, context?: LogContext) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: "ERROR",
      service: "@stive/browse-worker",
      message,
      ...(context ? redactSensitiveData(context) : {}),
    };
    console.error(JSON.stringify(logEntry));
  },
};
