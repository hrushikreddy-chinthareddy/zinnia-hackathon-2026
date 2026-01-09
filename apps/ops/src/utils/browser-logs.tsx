'use client';

import { datadogLogs } from '@datadog/browser-logs';

import { logDataDog } from './environment.helpers';

let isInitialized = false;
export const initializeBrowserLogging = () => {
    if (isInitialized) return;
    if (!logDataDog()) return;
    const token = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN || '';
    if (!token) return;
    datadogLogs.init({
        clientToken: token,
        site: process.env.NEXT_PUBLIC_DATADOG_SITE || 'datadoghq.com',
        service: 'zinnia-live-browser',
        forwardErrorsToLogs: true,
        sessionSampleRate: 100,
        env: process.env.NEXT_PUBLIC_DATADOG_ENV || '',
    });
    isInitialized = true;
    datadogLogs.logger.setLevel('info');
};
