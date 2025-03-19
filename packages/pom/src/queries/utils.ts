export interface ApiResponseError extends Error {
  status: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiResponseError | null;
}

export async function send<T>(request: Promise<Response>): Promise<T | null> {
  const response: ApiResponse<T> = await (await request).json();
  if (response.error || !response) {
    throw response.error;
  }
  return response.data;
}
