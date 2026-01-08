import { useTranslation } from 'next-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';

import ContentEntry from './illustration-details-content-entry';
import ContentSection from './illustration-details-content-section';
import { formatIllustrationDetailCurrency } from './illustration-details-helpers';
import { useIllustrationDetail } from '../../../providers/IllustrationDetailProvider';

export default function TermContentCoverage() {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const illustration = useIllustrationDetail();

    const faceAmount =
        illustration?.response?.assumed?.coverages?.base?.faceAmount ?? null;
    const faceAmountStr = numberFormatify(faceAmount);
    const planYears = illustration?.inputs?.options?.fixedCostPeriod;

    return (
        <ContentSection
            className="min-h-28"
            title={t('clientCase.illustrationDetails.coverage.title')}
        >
            <dl className="contents">
                <ContentEntry
                    label={t(
                        `clientCase.illustrationDetails.coverage.faceAmount`
                    )}
                    ddAriaLabel={faceAmountStr}
                >
                    {formatIllustrationDetailCurrency(t, faceAmount, true)}
                </ContentEntry>
                <ContentEntry
                    label={t(
                        'clientCase.illustrationDetails.coverage.termLength'
                    )}
                >
                    <span className="typography-content-body-bold">
                        {planYears != null
                            ? t('clientCase.illustrationDetails.numYears', {
                                  years: planYears,
                              })
                            : DEFAULT_ERROR_STRING}
                    </span>
                </ContentEntry>
            </dl>
        </ContentSection>
    );
}
