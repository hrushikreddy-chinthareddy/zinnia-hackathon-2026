export function throwTypedError(message: string, origin: string): never {
    const error = new Error(message);
    (error as any).origin = origin;
    throw error;
}
