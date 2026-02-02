import { Loader } from '@zinnia/bloom/components';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';

import styles from './spinner-message.module.css';

type LoaderSpinnerProps = {
    message: string;
};

export const SpinnerMessage = ({ message }: LoaderSpinnerProps) => {
    return (
        <>
            <section
                role="status"
                aria-busy="true"
                aria-live="polite"
                className={styles.spinnerContainer}
            >
                <Loader aria-hidden="true" data-testid="loader" />
                <Typography variant={TypographyVariant.LabelMd}>
                    {message}
                </Typography>
            </section>
        </>
    );
};
