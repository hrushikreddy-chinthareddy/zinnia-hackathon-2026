import { useTranslation } from 'react-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { numberFormatify } from '@deps/helpers/numbers.helpers';

import ContentEntry from './illustration-details-content-entry';
import ContentSection from './illustration-details-content-section';
import { useIllustrationDetail } from '../../../providers/IllustrationDetailProvider';

export function useIllustrationCashValueData() {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const illustration = useIllustrationDetail();

    if (!illustration || illustration.inputs.planCode === 'TL0101') {
        return [];
    }

    const { annualTimeSeriesData } = illustration.response.assumed;

    return annualTimeSeriesData
        .filter(({ year }) => [5, 10, 15, 20, 30].includes(year))
        .filter(({ netSurrenderValue }) => netSurrenderValue > 0)
        .map(({ year, netSurrenderValue }) => ({
            label: t(
                'clientCase.illustrationDetails.netSurrenderValue.atNYears',
                {
                    years: year,
                }
            ),
            value: netSurrenderValue,
        }));
}

export default function IllustrationDetailsContentCashValue({
    title,
}: {
    title?: string | null;
}) {
    const { t } = useTranslation(TranslationFiles.COMMON, {});

    const entries = useIllustrationCashValueData();

    if (!entries.length) {
        return null;
    }

    return (
        <ContentSection
            className="min-h-44"
            title={
                title ||
                t('clientCase.illustrationDetails.netSurrenderValue.title')
            }
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
