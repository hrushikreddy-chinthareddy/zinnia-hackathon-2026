declare global {
    namespace NodeJS {
        interface ProcessEnv {
            AUTH0_SECRET: string;
            AUTH0_BASE_URL: string;
            AUTH0_ISSUER_BASE_URL: string;
            AUTH0_CLIENT_ID: string;
            AUTH0_CLIENT_SECRET: string;
            NEXT_PUBLIC_BACKEND_URL: string;
            NEXT_PUBLIC_SE2_BACKEND_URL: string;
            NEXT_PUBLIC_BASE_URL: string;
            NEXT_PUBLIC_THEME: string;
            NEXT_PUBLIC_S3_BUCKET_BASE_URL: string;
            OPTIMIZELY_SDK_KEY: string;
            PINO_LOG_LEVEL: string;
            AUTH0_SESSION_ROLLING_DURATION: string;
        }
    }
}

export {};
