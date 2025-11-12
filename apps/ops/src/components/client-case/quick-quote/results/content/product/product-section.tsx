import { QuickQuoteProductHeaderRow } from './product-header-row';
import styles from '../content.module.css';
import { QuickQuoteTotalPremiumRangeSection } from './total-premium-range-section';
import { useQuickQuoteResults } from '../results-context';

export const QuickQuoteResultProductSection = () => {
    const { results = [] } = useQuickQuoteResults();

    return (
        <div className={styles.contentSubtable}>
            <QuickQuoteProductHeaderRow
                products={results.map(({ product }) => product)}
            />
            <QuickQuoteTotalPremiumRangeSection />
        </div>
    );
};
