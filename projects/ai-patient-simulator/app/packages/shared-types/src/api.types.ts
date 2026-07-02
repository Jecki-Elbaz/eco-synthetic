// Generic API response types

export interface ApiError {
  statusCode: number;
  message: string;
  code: string;     // machine-readable error code e.g. "CREDIT_HARD_LIMIT"
  requestId?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
