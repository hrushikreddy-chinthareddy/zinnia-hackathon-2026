export interface ApiResponseError extends Error {
  status: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiResponseError | null;
}
