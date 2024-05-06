declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AUTH0_SECRET: string;
      AUTH0_BASE_URL: string;
      AUTH0_ISSUER_BASE_URL: string;
      AUTH0_CLIENT_ID: string;
      AUTH0_CLIENT_SECRET: string;
      AUTH0_AUDIENCE: string;
      NEXT_PUBLIC_MOCK_API_REQUEST: string;
      NEXT_PUBLIC_BACKEND_URL: string;
      NEXT_PUBLIC_BASE_URL: string;
      AUTH0_SESSION_ROLLING_DURATION: string;
    }
  }
}

export {};
