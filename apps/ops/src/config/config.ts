import { User } from 'oidc-client-ts';

import { storage } from '@deps/helpers/sessionStorage.helpers';
export interface OAuthConfig {
    authority: string;
    clientId: string;
}

export interface Config {
    company: string;
    oauth: OAuthConfig;
    backendUrl: string;
    webSocketUrl: string;
    agGridLicenseKey: string;
}

export const authToken = (config: Config) => {
    const storageString = storage.getItem(
        `oidc.user:${config.oauth.authority}:${config.oauth.clientId}`
    );
    return storageString
        ? User.fromStorageString(storageString as string)
        : null;
};

export const setTokens = (
    config: Config,
    accessToken: string,
    idToken: string,
    refreshToken: string
) => {
    const storageString = storage.getItem(
        `oidc.user:${config.oauth.authority}:${config.oauth.clientId}`
    );

    if (storageString != undefined) {
        const user = JSON.parse(storageString as string);

        user.access_token = accessToken;
        user.id_token = idToken;
        user.refresh_token = refreshToken;

        storage.setItem(
            `oidc.user:${config.oauth.authority}:${config.oauth.clientId}`,
            JSON.stringify(user)
        );
    }
};
