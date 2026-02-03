import {
    logError,
    logTrace,
    parseErrorInformation,
    withAuthAndLogging,
} from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

interface Config {
    manifest: {
        module: string;
        version: string;
        assets: {
            css: string[];
            js: string[];
        };
    };
}

const manifests: Config[] = [
    {
        manifest: {
            module: 'contact-management',
            version: '1.0.0',
            assets: {
                css: [
                    `${process.env.NEXT_PUBLIC_ZEMBED_CDN_URL}/modules/ContactManagement/v1/ContactManagementModule.css`,
                ],
                js: [
                    `${process.env.NEXT_PUBLIC_ZEMBED_CDN_URL}/modules/ContactManagement/v1/ContactManagementModule.js`,
                ],
            },
        },
    },
    {
        manifest: {
            module: 'order-entry',
            version: '1.0.0',
            assets: {
                css: [
                    `${process.env.NEXT_PUBLIC_ZEMBED_CDN_URL}/modules/OrderEntry/v1/OrderEntryModule.css`,
                ],
                js: [
                    `${process.env.NEXT_PUBLIC_ZEMBED_CDN_URL}/modules/OrderEntry/v1/OrderEntryModule.js`,
                ],
            },
        },
    },
];

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse, loggingContext) => {
        const now = performance.now();
        logTrace('manifests::start', loggingContext);
        const { modules } = req.body;
        try {
            const configs: Config[] = [];
            modules.forEach((module: { name: string; version: string }) => {
                const config = manifests.find(
                    (config) => config.manifest.module === module.name
                );
                if (config) {
                    configs.push(config);
                }
            });
            logTrace('manifests::complete', {
                ...loggingContext,
                duration: performance.now() - now,
            });

            res.json({
                successful: configs,
                failed: [],
            });
        } catch (error) {
            logError('manifests::error', {
                ...parseErrorInformation(error),
                requestUrl: 'manifests',
                duration: performance.now() - now,
                ...loggingContext,
            });
            res.status((error as Response)?.status ?? 500).json({
                successful: [],
                failed: [],
            });
        }
    },
    { file: 'api/manifests', function: 'routeHandler' }
);
