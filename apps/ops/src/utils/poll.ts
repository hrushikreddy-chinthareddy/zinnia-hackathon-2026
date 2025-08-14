import { serverApi } from '@deps/queries/api-utils/serverApiClient';

import { LoggingContext } from './server-logging';

export const pollEndpoint = async (
    url: string,
    intervalSeconds: number,
    maxAttempts: number,
    accessToken: string,
    logCtx: LoggingContext
) => {
    let attempts = 0;

    return new Promise((resolve, reject) => {
        const intervalId = setInterval(async () => {
            attempts += 1;

            try {
                // Make the request to the endpoint
                const response = await serverApi.get(
                    url,
                    {
                        authorization: `Bearer ${accessToken}`,
                    },
                    logCtx
                );

                if (response.status === 200 && response.data) {
                    // Successfully received data, resolve the promise
                    clearInterval(intervalId);
                    resolve(response.data);
                } else if (attempts >= maxAttempts) {
                    // Max attempts reached, reject the promise
                    clearInterval(intervalId);
                    reject(
                        new Error(
                            'Max attempts reached without successful response'
                        )
                    );
                }
            } catch (error) {
                if (attempts >= maxAttempts) {
                    // Max attempts reached, reject the promise
                    clearInterval(intervalId);
                    reject(new Error('Max attempts reached with errors'));
                }
            }
        }, intervalSeconds * 1000);
    });
};
