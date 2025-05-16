export abstract class HttpRequest {
  abstract request: (
    input: string | URL | Request,
    init?: RequestInit | undefined,
    data?: BodyInit | null | undefined
  ) => Promise<Response>;

  get = (input: string | URL | Request, init?: RequestInit | undefined) => {
    init = init || {};
    init.method = 'GET';
    return this.request(input, init);
  };

  post = (
    input: string | URL | Request,
    data?: BodyInit | null | undefined,
    init?: RequestInit | undefined
  ) => {
    init = init || {};
    init.method = 'POST';
    init.body = data;
    return this.request(input, init, data);
  };

  put = (
    input: string | URL | Request,
    data?: BodyInit | null | undefined,
    init?: RequestInit | undefined
  ) => {
    init = init || {};
    init.method = 'PUT';
    init.body = data;
    return this.request(input, init, data);
  };
}
