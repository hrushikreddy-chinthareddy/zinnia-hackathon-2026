import { getSession } from '@auth0/nextjs-auth0';
import { Label } from '@zdx/bloom/components';

import { Addresses } from '@/components/addresses/Addresses';
import { BankData } from '@/components/bank-data/BankData';
import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
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
      nameOnAccount="Flora Anderson Anderson Anderson"
      title="Payment details"
    />
  );

  console.log('my user', session);
  return (
    <div className={styles.pageContainer}>
      <HeaderBreadcrumb title="Profile" />
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
                <FieldData Label={<Label>Mobile phone</Label>}>
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
                <FieldData Label={<Label>Personal email</Label>}>
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
          <FieldData Label={<Label>Policy owner</Label>}>
            <p className="typographyContentBodySm">Michael Williams</p>
          </FieldData>
        </div>
      </ClickableCardContainer>
    </div>
  );
}
