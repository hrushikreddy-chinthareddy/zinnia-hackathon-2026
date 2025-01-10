import { clsx } from 'clsx';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { Label } from '@zinnia/bloom/components';
import { default as styles } from './Identification.module.css';

export const Identification = () => {
    return (
        <div className={clsx(styles.cardSubSection)}>
            <Typography variant={TypographyVariant.H2} className={clsx(styles.cardSubSectionHeader)}>
                Identification
            </Typography>
            <div className={clsx(styles.cardSubSectionContent)}>
                <div>
                    <Label>Type of corporation</Label>
                    <Typography variant={TypographyVariant.BodySm}>Third party marketer</Typography>
                </div>
                <div>
                    <Label>Channel</Label>
                    <Typography variant={TypographyVariant.BodySm}>Independent marketing organization</Typography>
                </div>
                <div>
                    <Label>Tax identification number</Label>
                    <Typography variant={TypographyVariant.BodySm}>***-**-6789</Typography>
                </div>
            </div>
        </div>
    );
};
