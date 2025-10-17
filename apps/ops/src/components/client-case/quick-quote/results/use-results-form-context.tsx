import { useFormContext } from 'react-hook-form';

import { QuickQuoteFormState } from '../types';

export const useQuickQuoteResultsForm = () =>
    useFormContext<QuickQuoteFormState>();
