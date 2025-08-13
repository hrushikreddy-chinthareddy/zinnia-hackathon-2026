interface ErrorOptions {
  cause?: unknown;
}

class CustomError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);

    // needed for CustomError instanceof Error => true
    Object.setPrototypeOf(this, new.target.prototype);

    // Set the name
    this.name = this.constructor.name;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    // if (Error.captureStackTrace) {
    //   Error.captureStackTrace(this, this.constructor);
    // }
  }
}

// TODO: I think we can build types around what we expect the
// error cause to look like, if we start to establish that pattern
export class LogWarn extends CustomError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'LogWarn';
  }
}
