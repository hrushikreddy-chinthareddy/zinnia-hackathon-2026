export const toLowerCaseSearchParams = (searchParams: URLSearchParams) =>
    new URLSearchParams(
        Array.from(searchParams, ([name, value]) => [name.toLowerCase(), value])
    );
