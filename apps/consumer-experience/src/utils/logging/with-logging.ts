import { ApiResponse } from '@/services/types'; // Assuming ApiResponse is exported from here

import { getErrorCause, getErrorMessage } from './error-details';
import { logTrace } from './log-fns';
import { CommonLogContext } from './server-logging';

type ServerFunction<T extends unknown[], R> = (
  ...args: [...T, CommonLogContext]
) => Promise<ApiResponse<R>>;

/**
 *
 * This will always return a {data, error} object
 */
export function withLogging<T extends unknown[], R>(
  fn: (...args: [...T, CommonLogContext]) => Promise<R>,
  additionalLoggingContext: {
    file: string;
    functionName: string;
  }
): ServerFunction<T, R> {
  return async (...args: [...T, CommonLogContext]) => {
    const context = args[args.length - 1] as CommonLogContext;

    const loggingContext = {
      ...context,
      file: additionalLoggingContext.file,
      function: additionalLoggingContext.functionName,
    };

    // 1- Log start of function execution
    logTrace(
      `ServerFunction::${additionalLoggingContext.functionName}::start`,
      {
        ...loggingContext,
      }
    );

    const startTime = performance.now();

    try {
      const functionArgs = args.slice(0, -1) as T;
      const result = await fn(...functionArgs, loggingContext);

      // 2- Log completion
      logTrace(
        `ServerFunction::${additionalLoggingContext.functionName}::complete`,
        {
          ...loggingContext,
          duration: performance.now() - startTime,
        }
      );

      return { data: result, error: null } as ApiResponse<R>;
    } catch (err) {
      const cause = getErrorCause(err);
      const error: {
        message: string;
        name: string;
        cause: Record<string, unknown>;
        status?: unknown;
      } = {
        message: getErrorMessage(err),
        name: `ServerFunction::${additionalLoggingContext.functionName} Error`,
        cause,
      };

      if (cause?.status) {
        error.status = cause.status;
      }

      logTrace(
        `ServerFunction::${additionalLoggingContext.functionName}::error`,
        {
          ...loggingContext,
          duration: performance.now() - startTime,
          error,
        }
      );

      return {
        data: null,
        error,
      } as ApiResponse<R>;
    }
  };
}
