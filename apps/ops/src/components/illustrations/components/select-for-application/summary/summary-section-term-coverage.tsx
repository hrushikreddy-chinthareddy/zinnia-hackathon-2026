import { useTranslation } from 'next-i18next';

import { useIllustrationDetail } from '@deps/components/illustrations/providers/IllustrationDetailProvider';
import { TranslationFiles } from '@deps/config/translations';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import ContentEntry from './content-entry';
import ContentSection from './content-section';
import styles from './summary.module.css';
import { formatIllustrationDetailCurrencyBold } from '../../details/content/illustration-details-helpers';

export default function IllustrationSelectForApplicationSectionTermCoverage() {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const illustration = useIllustrationDetail();

    const faceAmount =
        illustration?.response?.assumed?.coverages?.base?.faceAmount ?? null;
    const faceAmountStr = numberFormatify(faceAmount);
    const planYears = illustration?.inputs?.options?.fixedCostPeriod;

    return (
        <ContentSection
            className={styles.coverageSection}
            title={t('clientCase.illustrationDetails.coverage.title')}
        >
            <dl className={styles.contentSectionContainer}>
                <ContentEntry
                    label={t(
                        `clientCase.illustrationDetails.coverage.faceAmount`
                    )}
                    ddAriaLabel={faceAmountStr}
                >
                    {formatIllustrationDetailCurrencyBold(t, faceAmount)}
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
