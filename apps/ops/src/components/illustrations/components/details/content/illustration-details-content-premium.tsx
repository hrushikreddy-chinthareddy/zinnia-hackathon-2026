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

export function useIllustrationPremiumData(): PremiumEntry[] {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const illustration = useIllustrationDetail();

    const formatters = {
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
    };

    if (!illustration) {
        return [
            {
                label: t('clientCase.illustrationDetails.premium.initial'),
                format: formatters.currency(null),
                value: null,
                type: 'currency',
            },
            {
                label: t('clientCase.illustrationDetails.premium.target'),
                format: formatters.currency(null),
                value: null,
                type: 'currency',
            },
        ];
    }

    const { options } = illustration.inputs;

    if (illustration.productType === ProductTypes.INDEX_UNIVERSAL_LIFE) {
        const iulData = illustration.response.assumed.annualTimeSeriesData;

        return (
            [
                {
                    label: t('clientCase.illustrationDetails.premium.initial'),
                    value: iulData[0]?.minimumPremiumAmount,
                    type: 'currencyPerYear',
                },
                {
                    label: t('clientCase.illustrationDetails.premium.target'),
                    value: iulData.at(-1)?.minimumPremiumAmount ?? null,
                    type: 'currencyPerYear',
                },
                {
                    label: t('clientCase.illustrationDetails.premium.mec'),
                    value: iulData[0]?.sevenPayPremiumAmount,
                    type: 'currencyPerYear',
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
        ).map((item) =>
            item.type === 'currencyPerYear'
                ? {
                      ...item,
                      format: formatters.currencyPerYear(item.value),
                  }
                : {
                      ...item,
                      format: formatters.text(item.value),
                  }
        );
    }

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
    ).map((item) =>
        item.type === 'currency'
            ? {
                  ...item,
                  format: formatters.currency(item.value),
              }
            : {
                  ...item,
                  format: formatters.text(item.value),
              }
    );
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
