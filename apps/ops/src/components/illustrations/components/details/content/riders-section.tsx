import { useTranslation } from 'next-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { ProductTypes } from '@deps/types/product';

import ContentEntry from './illustration-details-content-entry';
import ContentSection from './illustration-details-content-section';
import { useIllustrationRidersData } from './use-riders-data';
import { useIllustrationDetail } from '../../../providers/IllustrationDetailProvider';

export default function IllustrationDetailsContentRiders() {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const entries = useIllustrationRidersData();
    const illustration = useIllustrationDetail();

    const isIUL =
        illustration?.productType === ProductTypes.INDEX_UNIVERSAL_LIFE;

    return (
        <ContentSection
            className="min-h-28"
            title={t('clientCase.illustrationDetails.riders.title')}
        >
            <dl className="contents">
                {!entries.length && (
                    <ContentEntry
                        label={t(
                            'clientCase.illustrationDetails.riders.noRiders'
                        )}
                    >
                        {DEFAULT_ERROR_STRING}
                    </ContentEntry>
                )}
                {entries.map(({ label, format }) => (
                    <ContentEntry
                        key={label}
                        label={label}
                        ddAriaLabel={
                            (!isIUL &&
                                t(
                                    'clientCase.illustrationDetails.ariaValuePerYear',
                                    { value: format() }
                                )) ||
                            undefined
                        }
                    >
                        {!isIUL
                            ? format()
                            : t(
                                  'clientCase.illustrationDetails.riders.included'
                              )}
                    </ContentEntry>
                ))}
            </dl>
            {!!entries.length && !isIUL && (
                <div className="col-span-3 col-start-4 text-end [font:var(--typography-labels-label-sm-alt)] [color:var(--color-base-text-text-secondary)]">
                    {t(
                        'clientCase.illustrationDetails.riders.includedInPremiumsFootNote'
                    )}
                </div>
            )}
        </ContentSection>
    );
}
