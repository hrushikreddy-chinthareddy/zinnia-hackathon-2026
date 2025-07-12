import { useTranslation } from 'react-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { ProductTypes } from '@deps/types/product';

import ContentEntry from './illustration-details-content-entry';
import ContentSection from './illustration-details-content-section';
import { useIllustrationData } from '../illustration-data-provider';

export function useIllustrationPremiumData() {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const illustration = useIllustrationData();

    if (!illustration) {
        return [
            {
                label: t('clientCase.illustrationDetails.premium.initial'),
                value: null,
            },
            {
                label: t('clientCase.illustrationDetails.premium.target'),
                value: null,
            },
        ];
    }

    if (illustration.productType === ProductTypes.INDEX_UNIVERSAL_LIFE) {
        const { annualTimeSeriesData } = illustration.response.assumed;
        return [
            {
                label: t('clientCase.illustrationDetails.premium.initial'),
                value: annualTimeSeriesData[0].minimumPremiumAmount,
            },
            {
                label: t('clientCase.illustrationDetails.premium.target'),
                value: annualTimeSeriesData.at(-1)?.minimumPremiumAmount,
            },
            {
                label: t('clientCase.illustrationDetails.premium.mec'),
                value: annualTimeSeriesData[0].sevenPayPremiumAmount,
            },
        ];
    }

    const { annualTimeSeriesData, coverages } = illustration.response.assumed;

    return [
        {
            label: t('clientCase.illustrationDetails.premium.initialBase'),
            value: coverages.base.premium,
        },
        {
            label: t('clientCase.illustrationDetails.premium.totalInitial'),
            value: annualTimeSeriesData[0].premiumAmount,
        },
    ];
}

export default function IllustrationDetailsContentPremium() {
    const { t } = useTranslation(TranslationFiles.COMMON, {});

    const entries = useIllustrationPremiumData();
    return (
        <ContentSection
            title={t('clientCase.illustrationDetails.premium.title')}
        >
            <dl className="contents">
                {entries.map(({ label, value }, idx) => {
                    const valueStr = numberFormatify(value);
                    const className =
                        idx === 0
                            ? '[font:var(--typography-content-body-bold)]'
                            : '[font:var(--typography-content-body)]';
                    return (
                        <ContentEntry
                            key={label}
                            label={label}
                            ddAriaLabel={
                                t(
                                    'clientCase.illustrationDetails.ariaValuePerYear',
                                    { value: valueStr }
                                ) ?? undefined
                            }
                        >
                            <span className={className}>
                                {valueStr.slice(0, -3)}
                            </span>
                            {value
                                ? t(
                                      'clientCase.illustrationDetails.valuePerYear',
                                      { value: valueStr.slice(-3) }
                                  )
                                : DEFAULT_ERROR_STRING}
                        </ContentEntry>
                    );
                })}
            </dl>
        </ContentSection>
    );
}
