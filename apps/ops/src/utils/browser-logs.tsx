'use client';

import { datadogLogs } from '@datadog/browser-logs';
let isInitialized = false;
export const initializeBrowserLogging = () => {
    if (isInitialized) return;
    datadogLogs.init({
        clientToken: process.env.NEXT_PUBLIC_DATADOG_BROWSER_APPLICATION_ID || '',
        site: 'datadoghq.com',
        service: 'zinnia-live-browser',
        forwardErrorsToLogs: true,
        sessionSampleRate: 100,
        env: process.env.NEXT_PUBLIC_DATADOG_ENV || '',
    });
    isInitialized = true;
    datadogLogs.logger.setLevel('info');
};
