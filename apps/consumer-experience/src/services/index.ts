export interface ApiResponseError extends Error {
  status: number;
}

export type ApiResponse<T> = {
  data: T;
  error: null;
} | {
  data: null;
  error: ApiResponseError;
}

export * from './server-http';

export * from './api-config';
export * from './policy';
