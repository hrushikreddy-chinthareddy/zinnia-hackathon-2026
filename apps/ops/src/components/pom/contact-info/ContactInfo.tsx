import { Address, Label } from '@zinnia/bloom/components';
import { clsx } from 'clsx';

import { default as styles } from './ContactInfo.module.css';
import { ProducerType } from '../types';

export const ContactInfo = ({ producerType }: { producerType: ProducerType }) => {
    return (
        <div className={clsx(styles.cardSubSection)}>
            <h2 className={clsx(styles.cardSubSectionHeader, styles.h2)}>Contact Info</h2>
            <div className={clsx(styles.cardSubSectionContent)}>
                <div>
                    <Label>Business Address</Label>
                    <Address addrCountry="US" addrLine1="5412 Tomahawk St" city="Hastings" state="NE" zipCode="68901" />
                </div>
                <div>
                    <Label>Mailing address</Label>
                    <Address addrCountry="US" addrLine1="5412 Tomahawk St" city="Hastings" state="NE" zipCode="68901" />
                </div>
                {producerType === ProducerType.INDIVIDUAL && (
                    <div>
                        <Label>Residential address</Label>
                        <Address addrCountry="US" addrLine1="5412 Tomahawk St" city="Hastings" state="NE" zipCode="68901" />
                    </div>
                )}
                <div>
                    <Label>Business Phone</Label>
                    <span className={clsx(styles.span)}>+1 (234) 234-4545</span>
                </div>
                {producerType === ProducerType.INDIVIDUAL && (
                    <div>
                        <Label>Home Phone</Label>
                        <span className={clsx(styles.span)}>+1 (234) 234-4545</span>
                    </div>
                )}
                <div>
                    <Label>Mobile Phone</Label>
                    <span className={clsx(styles.span)}>+1 (234) 234-4545</span>
                </div>
                <div>
                    <Label>Fax</Label>
                    <span className={clsx(styles.span)}>+1 (234) 234-4545</span>
                </div>
                <div>
                    <Label>Email</Label>
                    <span className={clsx(styles.span)}>econners@advisor.net</span>
                </div>
            </div>
        </div>
    );
};
