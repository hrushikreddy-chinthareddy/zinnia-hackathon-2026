import { useFormContext } from 'react-hook-form';

import { QuickQuoteFormState } from '@deps/types/quickQuote';

export const useQuickQuoteResultsForm = () =>
    useFormContext<QuickQuoteFormState>();
