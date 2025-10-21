import { QuickQuoteFormData } from '@deps/types/quickQuote';
import { QuickQuoteProducts } from '@deps/utils/quick-quotes-rules/evaluate-quick-quote';
import { RULES_MODEL as FarmerProductsRules } from '@deps/utils/quick-quotes-rules/rules';

export const getQuickQuoteProductMapping = (input: QuickQuoteFormData) => {
    const results = new QuickQuoteProducts(
        FarmerProductsRules
    ).getProductsAvailableFor(input);
    console.log('results', results);

    return results;
};
