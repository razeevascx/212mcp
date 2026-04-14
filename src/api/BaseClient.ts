/**
 * Base API Client
 * Shared functionality for all Trading 212 API clients
 */

import { logger } from "@/utils/logger.js";
import { resolveAuthHeader } from "@/utils/auth.js";
import {
  Trading212Error,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  APIError,
} from "@/utils/errors.js";

interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

interface RequestContext {
  correlationId: string;
  method: string;
  endpoint: string;
}

export class BaseClient {
  protected readonly baseUrl: string;
  protected readonly authHeader: string;
  protected readonly defaultHeaders: Record<string, string>;

  constructor(apiToken?: string) {
    const environment = (process.env.ENVIRONMENT || "live").toLowerCase();
    if (environment !== "live" && environment !== "demo") {
      throw new ValidationError('ENVIRONMENT must be either "live" or "demo"');
    }

    this.baseUrl = process.env.TRADING212_BASE_URL
      ? process.env.TRADING212_BASE_URL
      : environment === "demo"
        ? "https://demo.trading212.com/api/v0"
        : "https://live.trading212.com/api/v0";

    this.authHeader = resolveAuthHeader(apiToken);

    this.defaultHeaders = {
      Authorization: this.authHeader,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  /**
   * Make a fetch request with error handling and rate-limit awareness
   */
  protected async request<T>(
    endpoint: string,
    options: FetchOptions = {},
  ): Promise<T> {
    return this.requestWithRetry<T>(endpoint, options);
  }

  private async requestWithRetry<T>(
    endpoint: string,
    options: FetchOptions = {},
    attempt = 1,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = { ...this.defaultHeaders, ...options.headers };
    const method = options.method || "GET";
    const correlationId = crypto.randomUUID();
    const startedAt = Date.now();
    const context: RequestContext = {
      correlationId,
      method,
      endpoint,
    };

    logger.debug("API Request", { ...context, url, attempt });

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: options.body,
      });
      const durationMs = Date.now() - startedAt;

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const error = new RateLimitError(
          "Rate limit exceeded",
          retryAfter ? Number.parseInt(retryAfter, 10) : undefined,
        );
        logger.warn("API Rate Limited", {
          ...context,
          status: response.status,
          retryAfter: error.retryAfter,
          durationMs,
          attempt,
        });
        if (attempt < 3) {
          const retryDelayMs = this.getRetryDelayMs(error.retryAfter, attempt);
          await this.sleep(retryDelayMs);
          return this.requestWithRetry(endpoint, options, attempt + 1);
        }
        throw error;
      }

      // Handle authentication errors
      if (response.status === 401) {
        throw new AuthenticationError("Invalid or expired API token");
      }

      // Handle not found
      if (response.status === 404) {
        throw new NotFoundError("Resource not found");
      }

      // Handle validation errors
      if (response.status === 400) {
        const errorData = await this.safeReadErrorBody(response);
        throw new ValidationError(
          errorData.message || "Validation error",
          errorData.details,
        );
      }

      // Handle other HTTP errors
      if (!response.ok) {
        const errorData = await this.safeReadErrorBody(response);
        throw new APIError(
          errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData.details,
        );
      }

      // Empty response (e.g., 204 No Content)
      if (response.status === 204) {
        return {} as T;
      }

      const data: T = await response.json();
      logger.debug("API Response", {
        ...context,
        status: response.status,
        durationMs,
      });
      return data;
    } catch (error) {
      if (error instanceof Trading212Error) {
        logger.warn("API Error", {
          ...context,
          error: error.message,
          code: error.code,
          statusCode: error.statusCode,
          attempt,
        });
        throw error;
      }

      // Handle network errors
      logger.error("Network Error", {
        ...context,
        error: String(error),
        attempt,
      });
      throw new APIError(`Network error: ${String(error)}`, 0);
    }
  }

  private getRetryDelayMs(retryAfterSeconds: number | undefined, attempt: number): number {
    if (retryAfterSeconds !== undefined && !Number.isNaN(retryAfterSeconds)) {
      return Math.max(retryAfterSeconds, 1) * 1000;
    }
    const exponentialBaseMs = 500;
    return exponentialBaseMs * 2 ** (attempt - 1);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async safeReadErrorBody(
    response: Response,
  ): Promise<{ message?: string; details?: Record<string, string> }> {
    try {
      const body = (await response.json()) as unknown;
      if (typeof body !== "object" || body === null || Array.isArray(body)) {
        return {};
      }

      const maybeBody = body as Record<string, unknown>;
      const message =
        typeof maybeBody.message === "string" ? maybeBody.message : undefined;
      const detailsRaw = maybeBody.details;
      const details =
        typeof detailsRaw === "object" &&
        detailsRaw !== null &&
        !Array.isArray(detailsRaw)
          ? (Object.fromEntries(
              Object.entries(detailsRaw).map(([key, value]) => [
                key,
                String(value),
              ]),
            ) as Record<string, string>)
          : undefined;

      return { message, details };
    } catch {
      return {};
    }
  }

  /**
   * Helper to build query parameters
   */
  protected buildQueryString(params: object): string {
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    }
    const query = queryParams.toString();
    return query ? `?${query}` : "";
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.request("/equity/account/summary");
      return !!response;
    } catch (error) {
      logger.error("API connection test failed", { error: String(error) });
      return false;
    }
  }
}
