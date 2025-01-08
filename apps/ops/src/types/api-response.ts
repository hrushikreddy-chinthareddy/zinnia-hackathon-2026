// BPB - copying over this pattern from Consumer for future API initiatives.
export interface ApiResponseError extends Error {
    status: number;
}

export interface ApiResponse<T> {
    data: T | null;
    error: ApiResponseError | null;
}
