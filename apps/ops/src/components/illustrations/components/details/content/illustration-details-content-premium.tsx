import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { ProductTypes } from '@deps/types/product';
import { Prettify } from '@deps/utils/types';

import ContentEntry from './illustration-details-content-entry';
import ContentSection from './illustration-details-content-section';
import {
    formatIllustrationDetailCurrency,
    formatIllustrationDetailYearlyCurrency,
    paymentFrequencies,
    paymentMethods,
} from './illustration-details-helpers';
import { useIllustrationDetail } from '../../../providers/IllustrationDetailProvider';

import type { Except } from 'type-fest';

type PremiumEntryBase = {
    label: string;
    format: (isBold?: boolean) => React.ReactNode;
};

type PremiumEntryTypes = {
    currency: {
        value: number | null;
    };
    currencyPerYear: {
        value: number | null;
    };
    text: {
        value: string | null;
    };
};

type PremiumEntry = {
    [K in keyof PremiumEntryTypes]: Prettify<
        {
            type: K;
        } & PremiumEntryBase &
            PremiumEntryTypes[K]
    >;
}[keyof PremiumEntryTypes];

const useFormatters = () => {
    const { t } = useTranslation(TranslationFiles.COMMON, {});

    return {
        currency:
            (value: number | null) =>
            (bold: boolean = false) =>
                value == null ? (
                    <span>{DEFAULT_ERROR_STRING}</span>
                ) : (
                    formatIllustrationDetailCurrency(t, value, bold)
                ),
        currencyPerYear:
            (value: number | null) =>
            (bold: boolean = false) =>
                value == null ? (
                    <span>{DEFAULT_ERROR_STRING}</span>
                ) : (
                    formatIllustrationDetailYearlyCurrency(t, value, bold)
                ),
        text:
            (value: string | null) =>
            (bold: boolean = false) =>
                (
                    <span className={boldClass(bold)}>
                        {value ? t(value) : DEFAULT_ERROR_STRING}
                    </span>
                ),
    } satisfies Record<
        keyof PremiumEntryTypes,
        (value: any) => (bold: boolean) => ReactNode
    >;
};

export function useIllustrationPremiumData(): PremiumEntry[] {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const illustration = useIllustrationDetail();

    const formatters = useFormatters();

    const addFormatter = (entry: Except<PremiumEntry, 'format'>) => ({
        ...entry,
        format:
            // This could have been done in a single line but typescript
            // made me do this instead
            entry.type === 'currency'
                ? formatters[entry.type](entry.value)
                : entry.type === 'currencyPerYear'
                ? formatters[entry.type](entry.value)
                : formatters[entry.type](entry.value),
    });

    if (!illustration) {
        return (
            [
                {
                    label: t('clientCase.illustrationDetails.premium.initial'),
                    value: null,
                    type: 'currency',
                },
                {
                    label: t('clientCase.illustrationDetails.premium.target'),
                    value: null,
                    type: 'currency',
                },
            ] as const
        ).map(addFormatter);
    }

    const { options } = illustration.inputs;

    if (illustration.productType === ProductTypes.INDEX_UNIVERSAL_LIFE) {
        const iulAssumed = illustration.response.assumed;

        return (
            [
                {
                    label: t('clientCase.illustrationDetails.premium.initial'),
                    value: iulAssumed.initial.totalPremium,
                    type: 'currency',
                },
                {
                    label: t('clientCase.illustrationDetails.premium.target'),
                    value: iulAssumed.initial.targetPremiumAmount,
                    type: 'currency',
                },
                {
                    label: t('clientCase.illustrationDetails.premium.mec'),
                    value: iulAssumed.initial.modifiedEndowmentPremium,
                    type: 'currency',
                },
                {
                    label: t(
                        'clientCase.illustrationDetails.premium.initialModal'
                    ),
                    value: iulAssumed.initial.totalModalPremium,
                    type: 'currency',
                },
                {
                    label: t('clientCase.illustrationDetails.premiumMode'),
                    value: paymentFrequencies[options.paymentMode],
                    type: 'text',
                },
                {
                    label: t('clientCase.illustrationDetails.paymentMode'),
                    value: paymentMethods[options.paymentMethod],
                    type: 'text',
                },
            ] as const
        ).map(addFormatter);
    }

    // Term and Term ROP

    const baseData = illustration.response.assumed;

    return (
        [
            {
                label: t('clientCase.illustrationDetails.premium.initial'),
                value: baseData.initial.totalPremium,
                type: 'currency',
            },
            {
                label: t('clientCase.illustrationDetails.premium.initialModal'),
                value: baseData.initial.totalModalPremium,
                type: 'currency',
            },
            {
                label: t('clientCase.illustrationDetails.premiumMode'),
                value: paymentFrequencies[options.paymentMode],
                type: 'text',
            },
            {
                label: t('clientCase.illustrationDetails.paymentMode'),

                value: paymentMethods[options.paymentMethod],
                type: 'text',
            },
        ] as const
    ).map(addFormatter);
}

// Utility function for font classes
const boldClass = (bold: boolean) =>
    bold
        ? '[font:var(--typography-content-body-bold)]'
        : '[font:var(--typography-content-body)]';

export default function IllustrationDetailsContentPremium() {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const entries = useIllustrationPremiumData();

    return (
        <ContentSection
            title={t('clientCase.illustrationDetails.premium.title')}
        >
            <dl className="contents">
                {entries.map(({ label, format }, idx) => (
                    <ContentEntry
                        key={label}
                        label={label}
                        ddAriaLabel={undefined} // optional, or handle per-row
                    >
                        {format(idx === 0)}
                    </ContentEntry>
                ))}
            </dl>
        </ContentSection>
    );
}
