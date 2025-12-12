export function assertUnreachable(obj: never): never {
    throw new Error(
        `An unreachable case has been called for ${obj}. Missing a case in switch statement.`
    );
}
