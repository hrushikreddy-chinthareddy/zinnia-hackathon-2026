import { useTranslation } from 'react-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { ProductTypes } from '@deps/types/product';

import ContentEntry from './illustration-details-content-entry';
import ContentSection from './illustration-details-content-section';
import { useIllustrationDetail } from '../../../providers/IllustrationDetailProvider';

export function useIllustrationAccountValueData() {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const illustration = useIllustrationDetail();

    if (!illustration || illustration.productType === ProductTypes.TERM) {
        return [];
    }

    const { annualTimeSeriesData } = illustration.response.assumed;

    return annualTimeSeriesData
        .filter(({ year }) => [5, 10, 15, 20, 30].includes(year))
        .map(({ year, accountValue }) => ({
            label: t('clientCase.illustrationDetails.accountValue.atNYears', {
                years: year,
            }),
            value: accountValue,
        }));
}

export default function IllustrationDetailsContentAccountValue() {
    const { t } = useTranslation(TranslationFiles.COMMON, {});

    const entries = useIllustrationAccountValueData();

    if (entries.length === 0) {
        return null;
    }

    return (
        <ContentSection
            className="min-h-44"
            title={t('clientCase.illustrationDetails.accountValue.title')}
        >
            <dl className="contents">
                {entries.map(({ label, value }) => (
                    <ContentEntry key={label} label={label}>
                        {numberFormatify(value, {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                        })}
                    </ContentEntry>
                ))}
            </dl>
        </ContentSection>
    );
}
