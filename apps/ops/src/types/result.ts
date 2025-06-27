export type Result<A, B> = Success<A, B> | Failure<A, B>;

export class Success<_A, B> {
    public readonly success = true;
    public readonly value: B;

    constructor(value: B) {
        this.value = value;
    }
}

export class Failure<A, _B> {
    public readonly success = false;
    public readonly error: A;

    constructor(error: A) {
        this.error = error;
    }
}

export function success<B>(value: B): Result<never, B> {
    return new Success(value);
}

export function failure<A>(error: A): Result<A, never> {
    return new Failure(error);
}
