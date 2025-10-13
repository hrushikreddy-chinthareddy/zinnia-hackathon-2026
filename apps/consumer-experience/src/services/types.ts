export interface ApiResponseError extends Error {
  status: number;
  correlationId?: string;
}

export type ApiResponse<T> =
  | {
      data: T;
      error: null;
    }
  | {
      data: null;
      error: ApiResponseError;
    };
