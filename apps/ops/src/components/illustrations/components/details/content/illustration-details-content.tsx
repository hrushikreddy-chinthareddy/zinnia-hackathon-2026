import { useTranslation } from 'next-i18next';

import { useIllustrationDetail } from '@deps/components/illustrations/providers/IllustrationDetailProvider';
import { TranslationFiles } from '@deps/config/translations';
import { ProductTypes } from '@deps/types/product';

import ContentCashValue from './illustration-details-content-cash-value';
import CoverageSection from './illustration-details-content-coverage';
import IulContentCoverage from './illustration-details-content-iul-coverage';
import ContentPremium from './illustration-details-content-premium';
import ContentRiders from './illustration-details-content-riders';
type IllustrationDetailsContentProps = {
    isLoading: boolean;
};
export default function IllustrationDetailsContent({
    isLoading,
}: IllustrationDetailsContentProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, {});

    const illustration = useIllustrationDetail();

    if (illustration?.productType === ProductTypes.INDEX_UNIVERSAL_LIFE) {
        return (
            <div className="flex flex-col p-6 gap-6">
                <IulContentCoverage />
                <ContentPremium />
                <ContentRiders isLoading={isLoading} />
                <ContentCashValue />
            </div>
        );
    }
    return (
        <div className="flex flex-col p-6 gap-6">
            <CoverageSection />
            <ContentPremium />
            <ContentRiders isLoading={isLoading} />
            <ContentCashValue
                title={t('clientCase.illustrationDetails.cashValue')}
            />
        </div>
    );
}
