/**
 * Custom error types for Trading 212 MCP Server
 */

export class Trading212Error extends Error {
  constructor(
    message: string,
    public code: string = "TRADING212_ERROR",
    public statusCode: number = 500,
    public details?: Record<string, string>,
  ) {
    super(message);
    this.name = "Trading212Error";
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

export class AuthenticationError extends Trading212Error {
  constructor(message: string, details?: Record<string, string>) {
    super(message, "AUTHENTICATION_ERROR", 401, details);
    this.name = "AuthenticationError";
  }
}

export class ValidationError extends Trading212Error {
  constructor(message: string, details?: Record<string, string>) {
    super(message, "VALIDATION_ERROR", 400, details);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Trading212Error {
  constructor(message: string, details?: Record<string, string>) {
    super(message, "NOT_FOUND", 404, details);
    this.name = "NotFoundError";
  }
}

export class RateLimitError extends Trading212Error {
  constructor(
    message: string,
    public retryAfter?: number,
  ) {
    super(message, "RATE_LIMIT_EXCEEDED", 429);
    this.name = "RateLimitError";
  }
}

export class APIError extends Trading212Error {
  constructor(
    message: string,
    statusCode: number,
    details?: Record<string, string>,
  ) {
    super(message, "API_ERROR", statusCode, details);
    this.name = "APIError";
  }
}
