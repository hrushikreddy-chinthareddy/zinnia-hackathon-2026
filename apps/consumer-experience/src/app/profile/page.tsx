import { getSession } from '@auth0/nextjs-auth0';
import { Label } from '@zdx/bloom/components';

import { BankData } from '@/components/bank-data/BankData';
import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';

import styles from './Profile.module.css';
import { Addresses } from '@/components/addresses/Addresses';

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
      nameOnAccount="Flora Anderson Anderson Anderson"
      title="Payment details"
    />
  );

  console.log('my user', session);
  return (
    <div className={styles.pageContainer}>
      <h1>Profile</h1>
      <HeaderPolicyDetails />
      <ClickableCardContainer
        listItems={[
          {
            content: (
              <div style={{ width: '100%' }}>
                <h2 className={styles.itemHeader}>Address</h2>
                <Addresses />
              </div>
            ),
          },
          {
            content: (
              <div className="typographyContentBodySm">
                <h2 className={styles.itemHeader}>Phone</h2>
                <FieldData
                  Label={<Label text="Mobile phone" labelFor="REMOVE"></Label>}
                >
                  <div>
                    <p>+1 (224) 234-2000</p>
                    <p>Call: 9am-12pm EST</p>
                  </div>
                </FieldData>
              </div>
            ),
          },
          {
            content: (
              <div className="typographyContentBodySm">
                <h2 className={styles.itemHeader}>Email</h2>
                <FieldData
                  Label={
                    <Label text="Personal email" labelFor="REMOVE"></Label>
                  }
                >
                  <div>
                    <p>example@example.com</p>
                  </div>
                </FieldData>
              </div>
            ),
          },
          { content: bankData },
        ]}
      >
        <div>
          <h2 className={styles.itemHeader}>Name</h2>
          <FieldData Label={<Label text="Policy owner" labelFor="" />}>
            <p className="typographyContentBodySm">Michael Williams</p>
          </FieldData>
        </div>
      </ClickableCardContainer>
    </div>
  );
}
