import { clsx } from 'clsx';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { Label } from '@zinnia/bloom/components';
import { default as styles } from './ContactInfo.module.css';

export const ContactInfo = () => {
    return (
        <div className={clsx(styles.cardSubSection)}>
            <Typography variant={TypographyVariant.H2} className={clsx(styles.cardSubSectionHeader)}>
                Contact Info
            </Typography>
            <div className={clsx(styles.cardSubSectionContent)}>
                <div>
                    <Label>Business Address</Label>
                    <Typography variant={TypographyVariant.BodySm}>Third party marketer</Typography>
                </div>
                <div>
                    <Label>Mailing address</Label>
                    <Typography variant={TypographyVariant.BodySm}>Independent marketing organization</Typography>
                </div>
                <div>
                    <Label>Phone</Label>
                    <Typography variant={TypographyVariant.BodySm}>+1 (234) 234-4545</Typography>
                </div>
                <div>
                    <Label>Fax</Label>
                    <Typography variant={TypographyVariant.BodySm}>+1 (234) 234-4545</Typography>
                </div>
                <div>
                    <Label>Email</Label>
                    <Typography variant={TypographyVariant.BodySm}>econners@advisor.net</Typography>
                </div>
            </div>
        </div>
    );
};
