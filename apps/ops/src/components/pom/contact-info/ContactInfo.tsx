import { clsx } from 'clsx';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { Address, Label } from '@zinnia/bloom/components';
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
                    <Address addrCountry="US" addrLine1="5412 Tomahawk St " city="Hastings" state="NE" zipCode="68901 " />
                </div>
                <div>
                    <Label>Mailing address</Label>
                    <Address addrCountry="US" addrLine1="5412 Tomahawk St " city="Hastings" state="NE" zipCode="68901 " />
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
