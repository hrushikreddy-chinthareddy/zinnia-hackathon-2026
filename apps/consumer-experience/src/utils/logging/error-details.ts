// Credit to https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript

type ErrorWithMessageAndCause = {
  message: string;
  cause: Record<string, unknown>;
};

function isErrorWithMessage(error: unknown): error is ErrorWithMessageAndCause {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

function isErrorWithCause(error: unknown): error is ErrorWithMessageAndCause {
  return typeof error === 'object' && error !== null && 'cause' in error;
}

export function getErrorMessage(error: unknown) {
  if (isErrorWithMessage(error)) {
    return error.message;
  }

  return 'An unexpected error occurred.';
}

export function getErrorCause(error: unknown) {
  if (isErrorWithCause(error)) {
    return error.cause;
  }

  return {};
}
