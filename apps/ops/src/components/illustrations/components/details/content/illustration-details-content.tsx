import { useTranslation } from 'next-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import ContentAccountValue from './illustration-details-content-account-value';
import CoverageSection from './illustration-details-content-coverage';
import ContentPremium from './illustration-details-content-premium';
import ContentRiders from './illustration-details-content-riders';
type IllustrationDetailsContentProps = {
    isLoading: boolean;
};
export default function IllustrationDetailsContent({
    isLoading,
}: IllustrationDetailsContentProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    return (
        <div className="flex flex-col p-6 gap-6">
            <CoverageSection />
            <ContentPremium />
            <ContentRiders isLoading={isLoading} />
            <ContentAccountValue />
        </div>
    );
}
