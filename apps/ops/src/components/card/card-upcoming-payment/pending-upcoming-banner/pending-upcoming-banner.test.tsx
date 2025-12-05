import { render, waitFor } from '@testing-library/react';
import { useTranslation } from 'next-i18next';

import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { Processes, Statuses } from '@deps/models/case/case';
import { getCases } from '@deps/queries/api/cases';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
// Import translations from actual files
import enTranslations from 'public/locales/en/common.json';
import esTranslations from 'public/locales/es/common.json';
import frTranslations from 'public/locales/fr/common.json';

import PendingUpcomingBanner from './pending-upcoming-banner';

// Mock dependencies
jest.mock('@deps/queries/api/cases');
jest.mock('@deps/contexts/OptimizelyContext');
jest.mock('next-i18next', () => ({
    useTranslation: jest.fn(),
}));

describe('PendingUpcomingBanner - Translation Tests', () => {
    const mockPolicyNumber = '123456789';
    const mockRequestSubTypes = ['PREMIUM', 'LOAN'];
    const mockCaseId = 'case-123';

    const mockCasesResponse = {
        total: 1,
        data: [{ id: mockCaseId }],
    };

    // Translation configurations
    const translationConfigs = {
        en: {
            translations: enTranslations,
        },
        es: {
            translations: esTranslations,
        },
        fr: {
            translations: frTranslations,
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (getCases as jest.Mock).mockResolvedValue(mockCasesResponse);
    });

    describe.each([
        ['English', 'en'],
        ['Spanish', 'es'],
        ['French', 'fr'],
    ])('%s translations', (languageName, languageCode) => {
        const config =
            translationConfigs[languageCode as keyof typeof translationConfigs];

        describe('with SYSTEMATIC_PROGRAMS_TABLE flag enabled', () => {
            beforeEach(() => {
                (useOptimizely as jest.Mock).mockReturnValue({
                    featureFlags: {
                        [FEATURE_FLAGS.SYSTEMATIC_PROGRAMS_TABLE]: true,
                    },
                });

                (useTranslation as jest.Mock).mockReturnValue({
                    t: (key: string) => {
                        const keys = key.split('.');
                        let value: any = config.translations;

                        for (const k of keys) {
                            value = value?.[k];
                        }

                        return value || key;
                    },
                    i18n: {
                        language: languageCode,
                    },
                });
            });

            it(`should display systematic program banner text in ${languageName}`, async () => {
                const { getByText } = render(
                    <PendingUpcomingBanner
                        policyNumber={mockPolicyNumber}
                        requestSubTypes={mockRequestSubTypes}
                    />
                );

                await waitFor(() => {
                    expect(getCases).toHaveBeenCalledWith(
                        {
                            limit: 5,
                            caseStatus: [Statuses.InProgress],
                            policyNumber: mockPolicyNumber,
                            process: [Processes.SSW],
                            requestSubType: mockRequestSubTypes,
                        },
                        expect.any(Object)
                    );
                });

                const expectedText =
                    config.translations.allFields.systematicProgramPendingBannerText.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
        });

        describe('with SYSTEMATIC_PROGRAMS_TABLE flag disabled', () => {
            beforeEach(() => {
                (useOptimizely as jest.Mock).mockReturnValue({
                    featureFlags: {
                        [FEATURE_FLAGS.SYSTEMATIC_PROGRAMS_TABLE]: false,
                    },
                });

                (useTranslation as jest.Mock).mockReturnValue({
                    t: (key: string) => {
                        const keys = key.split('.');
                        let value: any = config.translations;

                        for (const k of keys) {
                            value = value?.[k];
                        }

                        return value || key;
                    },
                    i18n: {
                        language: languageCode,
                    },
                });
            });

            it(`should display autopay banner text in ${languageName}`, async () => {
                const { getByText } = render(
                    <PendingUpcomingBanner
                        policyNumber={mockPolicyNumber}
                        requestSubTypes={mockRequestSubTypes}
                    />
                );

                await waitFor(() => {
                    expect(getCases).toHaveBeenCalled();
                });

                const expectedText =
                    config.translations.autopay.pendingBanner.text.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
        });
    });
});
