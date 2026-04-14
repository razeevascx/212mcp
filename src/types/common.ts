/**
 * Common Types
 * Shared type definitions across all features
 */

export interface ListResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

export interface Pagination {
  limit?: number;
  offset?: number;
}

export interface APIError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, string>;
}
