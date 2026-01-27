import { useEffect, useState } from 'react';

interface ZinniaConfig {
    modules: string[];
    debug?: boolean;
    accessToken: () => Promise<string>;
}

interface ZEmbedInitResult {
    success: boolean;
    error: Error | null;
}

export function useZEmbedInit(config: ZinniaConfig): ZEmbedInitResult {
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const initializeZEmbed = async () => {
            try {
                const zembedModule = await import(
                    /* @vite-ignore */
                    /* webpackIgnore: true */
                    `${process.env.NEXT_PUBLIC_ZEMBED_CDN_URL}/zembed/v1/zembed-bootstraper.mjs`
                );

                await zembedModule.initEmbeddedComponents({
                    clientId: 'zinnia-live',
                    modules: config.modules,
                    debug: config.debug,
                    apiUrl: process.env.NEXT_PUBLIC_ZEMBED_API_URL,
                    accessToken: config.accessToken,
                });

                setSuccess(true);
                setError(null);
                console.log('Zinnia initialized successfully');
            } catch (err) {
                const error =
                    err instanceof Error
                        ? err
                        : new Error('Failed to initialize ZEmbed');
                setSuccess(false);
                setError(error);
                console.error('Failed to initialize ZEmbed:', error);
            }
        };

        initializeZEmbed();
    }, [config]);

    return { success, error };
}
