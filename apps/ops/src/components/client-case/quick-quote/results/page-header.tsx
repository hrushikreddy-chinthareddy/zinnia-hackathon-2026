import { useTranslation } from 'react-i18next';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';

import { QuickQuoteResultsPageForm as ResultsPageForm } from './results-form';

export const QuickQuoteResultPageHeader = () => {
    const { t } = useTranslation(TranslationFiles.COMMON, {});

    return (
        <header>
            <Typography variant={TypographyVariant.H1}>
                {t('clientCase.quickQuoteResults.title')}
            </Typography>

            <ResultsPageForm />
        </header>
    );
};
