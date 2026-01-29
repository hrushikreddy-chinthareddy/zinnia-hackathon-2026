import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';

import { useQuickQuoteResultsForm } from '../use-results-form-context';
import styles from './print-template.module.css';

export const TemplateSummary = () => {
    const { getValues } = useQuickQuoteResultsForm();
    const {
        faceAmount,
        productType,
        insuredAge,
        sexAtBirth,
        nicotineUser,
        state,
    } = getValues();
    return (
        <section className={styles.summary}>
            <div className={styles.summaryAnswer}>
                <Typography variant={TypographyVariant.LabelMdAlt}>
                    Product type
                </Typography>
                <Typography variant={TypographyVariant.BodySm}>
                    {productType ?? 'Term'}
                </Typography>
            </div>
            <div className={styles.summaryAnswer}>
                <Typography variant={TypographyVariant.LabelMdAlt}>
                    Age
                </Typography>
                <Typography variant={TypographyVariant.BodySm}>
                    {insuredAge}
                </Typography>
            </div>
            <div className={styles.summaryAnswer}>
                <Typography variant={TypographyVariant.LabelMdAlt}>
                    Sex at birth
                </Typography>
                <Typography variant={TypographyVariant.BodySm}>
                    {sexAtBirth}
                </Typography>
            </div>
            <div className={styles.summaryAnswer}>
                <Typography variant={TypographyVariant.LabelMdAlt}>
                    Nicotine
                </Typography>
                <Typography variant={TypographyVariant.BodySm}>
                    {`${nicotineUser}`}
                </Typography>
            </div>
            <div className={styles.summaryAnswer}>
                <Typography variant={TypographyVariant.LabelMdAlt}>
                    State
                </Typography>
                <Typography variant={TypographyVariant.BodySm}>
                    {state}
                </Typography>
            </div>
            <div className={styles.summaryAnswer}>
                <Typography variant={TypographyVariant.LabelMdAlt}>
                    Face amount
                </Typography>
                <Typography variant={TypographyVariant.BodySm}>
                    ${faceAmount}
                </Typography>
            </div>
        </section>
    );
};
