import { QuickQuoteParams } from '@deps/types/quickQuote';

import { QuickQuoteFormContainer } from './quick-quote-form-container';
import { QuickQuoteResultsContent } from './results/content/results-content';
import { QuickQuoteResultsProvider } from './results/content/results-context';
import { QuickQuoteResultPageHeader as ResultPageHeader } from './results/page-header';

type QuickQuoteResultsPageProps = {
    quickQuoteParams: QuickQuoteParams;
};

export const QuickQuoteResultsPage = ({
    quickQuoteParams: params,
}: QuickQuoteResultsPageProps) => {
    return (
        <QuickQuoteFormContainer quickQuoteParams={params}>
            <QuickQuoteResultsProvider quickQuoteParams={params}>
                <ResultPageHeader />
                <QuickQuoteResultsContent />
            </QuickQuoteResultsProvider>
        </QuickQuoteFormContainer>
    );
};
