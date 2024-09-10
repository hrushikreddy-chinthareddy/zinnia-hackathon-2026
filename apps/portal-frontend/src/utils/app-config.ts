export type OAuthConfig = {
    authority: string;
    clientId: string;
    connection: string;
};

export type Config = {
    company: string;
    oauth: OAuthConfig;
    backendUrl: string;
    chunkSize: number;
};
