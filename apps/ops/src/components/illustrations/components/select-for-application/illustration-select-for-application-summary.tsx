import { IllustrationsClientCase } from '@deps/types/illustrations';
import { Product } from '@deps/types/product';

import styles from './illustration-select-for-application.module.css';
import SectionRiders from './summary/riders-section';
import SummaryHeader from './summary/summary-header';
import SectionCashValue from './summary/summary-section-cash-value';
import SectionCoverage from './summary/summary-section-coverage';
import SectionPremium from './summary/summary-section-premium';

type IllustrationContentSummaryProps = {
    clientCase: IllustrationsClientCase;
    product: Product;
    title?: string;
};

export default function IllustrationSelectForApplicationSummary({
    clientCase,
    ...props
}: IllustrationContentSummaryProps) {
    return (
        <div className={styles.contentSummary}>
            <SummaryHeader {...props} />
            <SectionCoverage clientCase={clientCase} />

            <SectionPremium />
            <SectionRiders />
            <SectionCashValue />
        </div>
    );
}
