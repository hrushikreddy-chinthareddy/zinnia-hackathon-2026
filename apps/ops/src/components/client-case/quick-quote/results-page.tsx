import { PrintProvider } from '@deps/contexts/printContext';
import { QuickQuoteParams } from '@deps/types/quickQuote';

import { QuickQuoteFormContainer } from './quick-quote-form-container';
import { QuickQuoteResultsContent } from './results/content/results-content';
import { QuickQuoteResultsProvider } from './results/content/results-context';
import { QuickQuoteResultPageHeader as ResultPageHeader } from './results/page-header';
import { QuickQuoteParamsProvider } from './results/params-context';
import { ResultsPrintContent } from './results/print-template/results-print-content';

type QuickQuoteResultsPageProps = {
    quickQuoteParams: QuickQuoteParams;
};

export const QuickQuoteResultsPage = ({
    quickQuoteParams: params,
}: QuickQuoteResultsPageProps) => {
    return (
        <QuickQuoteParamsProvider value={params}>
            <QuickQuoteFormContainer quickQuoteParams={params}>
                <QuickQuoteResultsProvider quickQuoteParams={params}>
                    <PrintProvider>
                        <ResultPageHeader />
                        <QuickQuoteResultsContent />
                        <div id="printable" style={{ display: 'none' }}>
                            <ResultsPrintContent />
                        </div>
                    </PrintProvider>
                </QuickQuoteResultsProvider>
            </QuickQuoteFormContainer>
        </QuickQuoteParamsProvider>
    );
};
