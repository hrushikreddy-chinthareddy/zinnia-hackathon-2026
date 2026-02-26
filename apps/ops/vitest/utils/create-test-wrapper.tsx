import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import i18next from 'i18next';
import React from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';

import colDefsEn from '@deps/../public/locales/en/colDefs.json';
import commonEn from '@deps/../public/locales/en/common.json';
import pomEn from '@deps/../public/locales/en/pom.json';
import reg60DefsEn from '@deps/../public/locales/en/reg60Defs.json';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import { MockOptimizelyProvider } from './mock-optimizely-provider';

export interface CreateTestWrapperOptions {
    featureFlags?: Partial<Record<FEATURE_FLAGS, boolean>>;
    queryClientOptions?: ConstructorParameters<typeof QueryClient>[0];
}

/**
 * Creates a test wrapper component with i18n, React Query, and Optimizely providers.
 *
 * @example
 * ```tsx
 * import { createTestWrapper } from '../../vitest/utils/create-test-wrapper';
 * import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
 *
 * const wrapper = createTestWrapper({
 *   featureFlags: {
 *     [FEATURE_FLAGS.CASE_STATS_COUNT]: true,
 *   },
 * });
 *
 * render(<YourComponent />, { wrapper });
 * ```
 */
export function createTestWrapper(options: CreateTestWrapperOptions = {}) {
    const { featureFlags = {}, queryClientOptions } = options;

    const i18nInstance = i18next.createInstance();
    i18nInstance.use(initReactI18next).init({
        lng: 'en',
        fallbackLng: 'en',
        ns: ['common', 'colDefs', 'pom', 'reg60Defs'],
        defaultNS: 'common',
        resources: {
            en: {
                common: commonEn,
                colDefs: colDefsEn,
                pom: pomEn,
                reg60Defs: reg60DefsEn,
            },
        },
        interpolation: { escapeValue: false },
    });

    const queryClient = new QueryClient(
        queryClientOptions ?? {
            defaultOptions: { queries: { retry: false, gcTime: 0 } },
        }
    );

    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <I18nextProvider i18n={i18nInstance}>
                <QueryClientProvider client={queryClient}>
                    <MockOptimizelyProvider featureFlags={featureFlags}>
                        {children}
                    </MockOptimizelyProvider>
                </QueryClientProvider>
            </I18nextProvider>
        );
    }

    return Wrapper;
}
