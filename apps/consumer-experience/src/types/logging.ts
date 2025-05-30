export type UserInfo = {
  sessionId?: string;
  partyId?: string;
  userId?: string;
  email?: string;
};

export type LoggingContext = {
  correlationId: string; // the correlationId passed as x-correlation-id in the header of a request to the gateway
  inputs:
    | {
        // request body
        [key: string]: any;
      }
    | undefined;
  file: string; // what file you're calling this from
  function: string; // what function/method you're calling this from
  method: string | undefined; // http verb
  page: string | undefined; // the page for page views,
  params: Record<string, any> | undefined; // query params of the page for page views, request params for api requests
  referrer?: string | null; // the referer for page views and api requests
  url: string | undefined; // the request URL for api requests, undefined for page views
  user: UserInfo | undefined;
  [key: string]: any; // any other values
};
