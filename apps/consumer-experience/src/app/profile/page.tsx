import { getSession } from '@auth0/nextjs-auth0';
import { Label } from '@zdx/bloom/components';

import { BankData } from '@/components/bank-data/BankData';
import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';

import styles from './Profile.module.css';

export default async function Profile() {
  const session = await getSession();

  if (!session) {
    // TODO:
  }

  const bankData = (
    <BankData
      accountNumber={1234}
      accountType="Checking"
      autopayEnabled
      routingNumber={121000358}
      bankName="Bank of America"
      nameOnAccount="Flora Anderson"
      title="Payment details"
    />
  );

  console.log('my user', session);
  return (
    <div className={styles.pageContainer}>
      <h1>Profile</h1>
      <HeaderPolicyDetails />
      <ClickableCardContainer listItems={[{ content: bankData }]}>
        <div>
          <h2 className={styles.itemHeader}>Name</h2>
          <FieldData Label={<Label labelFor="">Policy owner</Label>}>
            <p className="typography-content-body-sm">Michael Williams</p>
          </FieldData>
        </div>
      </ClickableCardContainer>
    </div>
  );
}
