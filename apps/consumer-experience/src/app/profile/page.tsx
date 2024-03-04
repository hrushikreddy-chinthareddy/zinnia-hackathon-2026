import { Label } from '@zinnia/bloom/internal/components';

import { BankData } from '@/components/bank-data/BankData';
import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';
import { Addresses } from '@/components/person-data/Addresses';
import { Emails } from '@/components/person-data/Emails';
import { Phones } from '@/components/person-data/Phones';
import { BankDetails } from '@/components/person-data/types';
import { baseAppUrl } from '@/services/api-config';
import { serverApi } from '@/services/server';

import styles from './Profile.module.css';

export default async function Profile() {
  const data = await Promise.allSettled([
    serverApi.get(`${baseAppUrl}/api/profile`),
    // TODO: is this how we actually want to do this?
    serverApi.get(`${baseAppUrl}/api/policies/2345`),
  ]);

  const profileResult = data?.[0];
  const policyResult = data?.[1];

  // TODO: Its time to talk error handling!!!!
  if (profileResult?.status === 'rejected') {
    return null;
  }

  const profileData = profileResult.value?.data;
  const policyHeaderData =
    policyResult?.status === 'fulfilled'
      ? policyResult.value?.data?.policyDetails
      : {};

  const bankDetails = profileData.bankDetails[0];

  const listItems = [];

  if (profileData.addresses && profileData.addresses.length > 0) {
    listItems.push({
      content: (
        <Addresses addressData={profileData.addresses} title="Address" />
      ),
    });
  }

  if (profileData.phones && profileData.phones.length > 0) {
    listItems.push({
      content: <Phones phoneData={profileData.phones} title="Phone" />,
    });
  }

  if (profileData.emails && profileData.emails.length > 0) {
    listItems.push({
      content: <Emails emailData={profileData.emails} title="Email" />,
    });
  }

  if (bankDetails.length > 0) {
    const allBankData = bankDetails.map((bankDetail: BankDetails) => {
      return (
        <BankData
          key={bankDetail.accountNumber}
          accountNumber={bankDetail.accountNumber}
          accountType={bankDetail.accountType}
          autopayEnabled={bankDetail.autopayEnabled}
          routingNumber={bankDetail.routingNumber}
          bankName={bankDetail.branchName}
          nameOnAccount={bankDetail.nameOnAccount}
        />
      );
    });

    listItems.push({
      content: (
        <div className={styles.multipleItemsInSection}>
          <h2>Payment details</h2>
          {allBankData}
        </div>
      ),
    });
  }

  return (
    <div className={styles.pageContainer}>
      <HeaderBreadcrumb title="Profile" />
      <HeaderPolicyDetails {...policyHeaderData} />
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
