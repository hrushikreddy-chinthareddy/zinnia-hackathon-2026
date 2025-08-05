import { useTranslation } from 'react-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { ProductTypes } from '@deps/types/product';

import ContentEntry from './illustration-details-content-entry';
import ContentSection from './illustration-details-content-section';
import {
    formatIllustrationDetailYearlyCurrency,
    paymentFrequencies,
    paymentMethods,
} from './illustration-details-helpers';
import { useIllustrationDetail } from '../../../providers/IllustrationDetailProvider';

type PremiumEntry = {
    label: string;
    format: (isBold: boolean) => React.ReactNode;
};

export function useIllustrationPremiumData(): PremiumEntry[] {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const illustration = useIllustrationDetail();

    if (!illustration) {
        return [
            {
                label: t('clientCase.illustrationDetails.premium.initial'),
                format: () => <span>{DEFAULT_ERROR_STRING}</span>,
            },
            {
                label: t('clientCase.illustrationDetails.premium.target'),
                format: () => <span>{DEFAULT_ERROR_STRING}</span>,
            },
        ];
    }

    const { options } = illustration.inputs;

    if (illustration.productType === ProductTypes.INDEX_UNIVERSAL_LIFE) {
        const iulData = illustration.response.assumed.annualTimeSeriesData;

        return [
            {
                label: t('clientCase.illustrationDetails.premium.initial'),
                format: () =>
                    formatIllustrationDetailYearlyCurrency(
                        t,
                        iulData[0]?.minimumPremiumAmount
                    ),
            },
            {
                label: t('clientCase.illustrationDetails.premium.target'),

                format: () =>
                    formatIllustrationDetailYearlyCurrency(
                        t,
                        iulData[0]?.minimumPremiumAmount
                    ),
            },
            {
                label: t('clientCase.illustrationDetails.premium.mec'),
                format: () =>
                    formatIllustrationDetailYearlyCurrency(
                        t,
                        iulData[0]?.sevenPayPremiumAmount
                    ),
            },
            {
                label: 'Premium Mode',
                format: (bold) => (
                    <span className={boldClass(bold)}>
                        {paymentFrequencies[options.paymentMode]
                            ? t(paymentFrequencies[options.paymentMode])
                            : DEFAULT_ERROR_STRING}
                    </span>
                ),
            },
            {
                label: 'Payment Mode',
                format: (bold) => (
                    <span className={boldClass(bold)}>
                        {paymentMethods[options.paymentMethod]
                            ? t(paymentMethods[options.paymentMethod])
                            : DEFAULT_ERROR_STRING}
                    </span>
                ),
            },
        ];
    }

    const baseData = illustration.response.assumed;

    return [
        {
            label: t('clientCase.illustrationDetails.premium.initialBase'),
            format: () =>
                formatIllustrationDetailYearlyCurrency(
                    t,
                    baseData.coverages.base.premium
                ),
        },
        {
            label: t('clientCase.illustrationDetails.premium.totalInitial'),
            format: () =>
                formatIllustrationDetailYearlyCurrency(
                    t,
                    baseData.annualTimeSeriesData[0].premiumAmount
                ),
        },
        {
            label: t('clientCase.illustrationDetails.premiumMode'),
            format: (bold) => (
                <span className={boldClass(bold)}>
                    {paymentFrequencies[options.paymentMode]
                        ? t(paymentFrequencies[options.paymentMode])
                        : DEFAULT_ERROR_STRING}
                </span>
            ),
        },
        {
            label: t('clientCase.illustrationDetails.paymentMode'),
            format: (bold) => (
                <span className={boldClass(bold)}>
                    {paymentMethods[options.paymentMethod]
                        ? t(paymentMethods[options.paymentMethod])
                        : DEFAULT_ERROR_STRING}
                </span>
            ),
        },
    ];
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
