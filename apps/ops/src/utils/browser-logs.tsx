'use client';

import { datadogLogs } from '@datadog/browser-logs';

export const initializeBrowserLogging = () => {
    datadogLogs.init({
        clientToken: process.env.NEXT_PUBLIC_DATADOG_BROWSER_TOKEN || '',
        site: 'datadoghq.com',
        service: 'zinnia-live-browser',
        forwardErrorsToLogs: true,
        sessionSampleRate: 100,
        env: process.env.NEXT_PUBLIC_DATADOG_ENV || '',
    });

    datadogLogs.logger.setLevel('info');
};
