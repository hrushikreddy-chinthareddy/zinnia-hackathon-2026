// Datadog needs to be inited (inited?) from a client component
// https://docs.datadoghq.com/real_user_monitoring/guide/monitor-your-nextjs-app-with-rum/?tab=npm

'use client';

import { datadogRum } from '@datadog/browser-rum';

import { logDataDog } from '@/utils';

if (logDataDog()) {
  datadogRum.init({
    applicationId: process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID || '',
    clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN || '',
    site: 'datadoghq.com',
    service: 'consumer-xd',
    env: process.env.NEXT_PUBLIC_DATADOG_ENV || '',
    version: process.env.NEXT_PUBLIC_GIT_SHA,
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: 'mask',
  });
}

export const DataDogInit = () => null;
