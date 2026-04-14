/**
 * Base API Client
 * Shared functionality for all Trading 212 API clients
 */

import { logger } from "@/utils/logger.js";
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

    const explicitHeader = process.env.TRADING212_AUTH_HEADER;
    const apiKey = process.env.TRADING212_API_KEY;
    const apiSecret = process.env.TRADING212_API_SECRET;
    const legacyToken = apiToken ?? process.env.TRADING212_API_TOKEN;

    if (explicitHeader) {
      this.authHeader = explicitHeader;
    } else if (apiKey && apiSecret) {
      const encoded = Buffer.from(`${apiKey}:${apiSecret}`, "utf8").toString(
        "base64",
      );
      this.authHeader = `Basic ${encoded}`;
    } else if (legacyToken) {
      // Legacy compatibility path; official v0 public API expects Basic auth.
      this.authHeader = `Bearer ${legacyToken}`;
    } else {
      throw new AuthenticationError(
        "Set TRADING212_API_KEY + TRADING212_API_SECRET (or TRADING212_AUTH_HEADER)",
      );
    }

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
    const url = `${this.baseUrl}${endpoint}`;
    const headers = { ...this.defaultHeaders, ...options.headers };

    logger.debug("API Request", { method: options.method || "GET", url });

    try {
      const response = await fetch(url, {
        method: options.method || "GET",
        headers,
        body: options.body,
      });

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        throw new RateLimitError(
          "Rate limit exceeded",
          retryAfter ? Number.parseInt(retryAfter, 10) : undefined,
        );
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
      logger.debug("API Response", { status: response.status, endpoint });
      return data;
    } catch (error) {
      if (error instanceof Trading212Error) {
        logger.warn("API Error", { endpoint, error: error.message });
        throw error;
      }

      // Handle network errors
      logger.error("Network Error", { endpoint, error: String(error) });
      throw new APIError(`Network error: ${String(error)}`, 0);
    }
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
