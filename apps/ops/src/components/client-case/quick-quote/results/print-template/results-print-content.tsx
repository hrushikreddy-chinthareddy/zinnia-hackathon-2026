import styles from './print-template.module.css';
import { TemplateHeader } from './template-header';
import { TemplateSummary } from './template-summary';
import { QuickQuoteResultsContent } from '../content/results-content';

export const ResultsPrintContent = () => {
    return (
        <div className={styles.mainContainer}>
            <TemplateHeader />
            <TemplateSummary />
            <QuickQuoteResultsContent />
        </div>
    );
};
