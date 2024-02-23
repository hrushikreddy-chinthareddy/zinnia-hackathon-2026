import { Label } from '@zinnia/bloom/components';

import { FieldData } from '@/components/field-data/FieldData';
import { isEndDated } from '@/utils/data';

import styles from './PersonData.module.css';
import { EmailProps, EmailType } from './types';

export const Emails = ({ emailData, title }: EmailProps) => {
  console.log('EMAIL DATA', emailData);
  const emails = emailData.filter(
    email => email.emailAddress !== null && !isEndDated(email.endDate)
  );

  if (!emails || emails.length === 0) {
    return null;
  }

  const personalEmails = emails?.filter(
    email => email.emailType === EmailType.Personal
  );
  const businessEmails = emails?.filter(
    email => email.emailType === EmailType.Business
  );
  const otherEmails = emails?.filter(
    email => email.emailType === EmailType.Other
  );

  return (
    <div className={styles.itemsRowContainer}>
      <h2 className={styles.itemHeader}>{title}</h2>
      <div className={styles.itemsRow}>
        {personalEmails.map(email => (
          <FieldData Label={<Label>Personal</Label>} key="personal">
            <div>
              <p className="typography-content-body-sm">{email.emailAddress}</p>
            </div>
          </FieldData>
        ))}
        {businessEmails.map(email => (
          <FieldData Label={<Label>Business</Label>} key="business">
            <div>
              <p className="typography-content-body-sm">{email.emailAddress}</p>
            </div>
          </FieldData>
        ))}
        {otherEmails.map(email => (
          <FieldData Label={<Label>Other</Label>} key="other">
            <div>
              <p className="typography-content-body-sm">{email.emailAddress}</p>
            </div>
          </FieldData>
        ))}
      </div>
    </div>
  );
};
