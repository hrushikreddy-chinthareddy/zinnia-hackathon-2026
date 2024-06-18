import { EmailType } from '@zinnia/api-types/types/sor';
import { Label } from '@zinnia/bloom/components';

import { FieldData } from '@/components/field-data/FieldData';
import { Email } from '@/components/pii/Email';

import styles from './PersonData.module.css';
import { EmailProps } from './types';

export const Emails = ({ emails, title }: EmailProps) => {
  if (!emails || emails.length === 0) {
    return null;
  }

  const personalEmails = emails?.filter(
    email => email.emailType === EmailType.PERSONAL
  );
  const businessEmails = emails?.filter(
    email => email.emailType === EmailType.BUSINESS
  );
  const otherEmails = emails?.filter(
    email => email.emailType === EmailType.OTHER
  );

  return (
    <div className={styles.itemsRowContainer}>
      <h2 className="mb-lg">{title}</h2>
      <div className={styles.itemsRow}>
        {personalEmails.map(email => (
          <FieldData Label={<Label>Personal email</Label>} key="personal">
            <div>
              <p className="typography-content-body-sm">
                <Email emailAddress={email.emailAddress} />
              </p>
            </div>
          </FieldData>
        ))}
        {businessEmails.map(email => (
          <FieldData Label={<Label>Business email</Label>} key="business">
            <div>
              <p className="typography-content-body-sm">
                <Email emailAddress={email.emailAddress} />
              </p>
            </div>
          </FieldData>
        ))}
        {otherEmails.map(email => (
          <FieldData Label={<Label>Other</Label>} key="other">
            <div>
              <p className="typography-content-body-sm">
                <Email emailAddress={email.emailAddress} />
              </p>
            </div>
          </FieldData>
        ))}
      </div>
    </div>
  );
};
