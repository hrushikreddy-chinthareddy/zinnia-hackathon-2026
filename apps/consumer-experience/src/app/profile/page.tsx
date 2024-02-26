import { Label } from '@zinnia/bloom/components-internal';

import { BankData } from '@/components/bank-data/BankData';
import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';
import { Addresses } from '@/components/person-data/Addresses';
import { Emails } from '@/components/person-data/Emails';
import { Phones } from '@/components/person-data/Phones';
import { baseAppUrl } from '@/services/api-config';
import { serverApi } from '@/services/server';

import styles from './Profile.module.css';

export default async function Profile() {
  const { data } = await serverApi.get(`${baseAppUrl}/api/profile`);

  const bankDetails = data.bankDetails?.[0];

  const listItems = [];

  if (data.addresses && data.addresses.length > 0) {
    listItems.push({
      content: <Addresses addressData={data.addresses} title="Address" />,
    });
  }

  if (data.phones && data.phones.length > 0) {
    listItems.push({
      content: <Phones phoneData={data.phones} title="Phone" />,
    });
  }

  if (data.emails && data.emails.length > 0) {
    listItems.push({
      content: <Emails emailData={data.emails} title="Email" />,
    });
  }

  if (bankDetails) {
    listItems.push({
      content: (
        <BankData
          accountNumber={bankDetails.accountNumber}
          accountType={bankDetails.accountType}
          // TODO: what data informs this?
          // autopayEnabled={bankDetails}
          routingNumber={bankDetails.routingNumber}
          bankName={bankDetails.branchName}
          nameOnAccount={bankDetails.nameOnAccount}
          title="Payment details"
        />
      ),
    });
  }

  return (
    <div className={styles.pageContainer}>
      <HeaderBreadcrumb title="Profile" />
      <HeaderPolicyDetails />
      <ClickableCardContainer listItems={[...listItems]}>
        <div>
          <h2 className={styles.itemHeader}>Name</h2>
          <FieldData Label={<Label>Policy owner</Label>}>
            <p className="typography-content-body-sm">Michael Williams</p>
          </FieldData>
        </div>
      </ClickableCardContainer>
    </div>
  );
}
