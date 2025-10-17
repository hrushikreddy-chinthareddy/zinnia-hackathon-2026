import styles from './content.module.css';
import { QuickQuoteResultProductSection } from './product/product-section';
import { useQuickQuoteResults } from './results-context';
import { QuickQuoteResultSummarySection } from './summary-section';

export const QuickQuoteResultsContent = () => {
    const { results } = useQuickQuoteResults();

    if (!results) {
        // TODO: Return skeleton
        return null;
    }

    return (
        <div
            className={styles.contentMainTable}
            style={{
                gridTemplateColumns: `minmax(max-content, 370px) repeat(${results.length}, minmax(auto, 320px))`,
            }}
        >
            <QuickQuoteResultProductSection />
            <QuickQuoteResultSummarySection />
        </div>
    );
};
