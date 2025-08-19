import { Product } from '@deps/types/product';

import styles from './illustration-select-for-application.module.css';
import SectionRiders from './summary/riders-section';
import SummaryHeader from './summary/summary-header';
import SectionCashValue from './summary/summary-section-cash-value';
import SectionCoverage from './summary/summary-section-coverage';
import SectionPremium from './summary/summary-section-premium';

type IllustrationContentSummaryProps = {
    product: Product;
    title?: string;
};

export default function IllustrationSelectForApplicationSummary(
    props: IllustrationContentSummaryProps
) {
    return (
        <div className={styles.contentSummary}>
            <SummaryHeader {...props} />
            <SectionCoverage />

            <SectionPremium />
            <SectionRiders />
            <SectionCashValue />
        </div>
    );
}
