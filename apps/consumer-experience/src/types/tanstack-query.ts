import { ApiResponseError } from '@/services';
import '@tanstack/react-query';

declare module '@tanstack/react-query' {
  interface Register {
    // Use unknown so call sites must narrow explicitly.
    defaultError: ApiResponseError;
  }
}
