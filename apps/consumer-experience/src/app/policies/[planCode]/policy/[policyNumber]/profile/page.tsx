import { Address, Email, Phone } from '@zinnia/api-types/types/sor';
import { Label } from '@zinnia/bloom/internal/components';
import { headers } from 'next/headers';

import { BankData } from '@/components/bank-data/BankData';
import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';
import { Addresses } from '@/components/person-data/Addresses';
import { Emails } from '@/components/person-data/Emails';
import { Phones } from '@/components/person-data/Phones';
import { getPolicyProfileData } from '@/services';
import { filterItemsWithPastEndDate, fullName } from '@/utils/data';

import styles from './Profile.module.css';

export default async function Profile() {
  const headerStore = headers();

  const { data, error } = await getPolicyProfileData({
    planCode: headerStore.get('planCode') || '',
    policyNumber: headerStore.get('policyNumber') || '',
  });

  if (error) {
    <div className={styles.pageContainer}>
      <HeaderBreadcrumb title="Profile" />
      <HeaderPolicyDetails />
      <ClickableCardContainer>
        <div>No data available</div>
      </ClickableCardContainer>
    </div>;
  }

  const listItems = [];
  const profileData = data!;
  if (profileData.addresses) {
    const currentAddresses = filterItemsWithPastEndDate(profileData.addresses);

    if (currentAddresses) {
      listItems.push({
        content: (
          <Addresses
            addresses={currentAddresses as Address[]}
            title="Address"
            preferredAddressIndicator={profileData.preferredAddressIndicator}
          />
        ),
      });
    }
  }

  if (profileData.phones) {
    const currentPhones = filterItemsWithPastEndDate(profileData.phones);

    if (currentPhones) {
      listItems.push({
        content: <Phones phones={currentPhones as Phone[]} title="Phone" />,
      });
    }
  }

  if (profileData.emails) {
    const currentEmails = filterItemsWithPastEndDate(profileData.emails);

    if (currentEmails) {
      listItems.push({
        content: <Emails emails={currentEmails as Email[]} title="Email" />,
      });
    }
  }

  if (profileData?.bankDetails?.length > 0) {
    const allBankData = profileData.bankDetails.map(bankDetail => {
      return (
        <BankData
          key={bankDetail.accountNumber}
          accountNumber={bankDetail.accountNumber || ''}
          accountType={bankDetail.accountType || ''}
          autopayEnabled={bankDetail.autopayEnabled}
          routingNumber={bankDetail.routingNumber || ''}
          bankName={bankDetail.branchName || ''}
          nameOnAccount={bankDetail.nameOnAccount || ''}
        />
      );
    });

    listItems.push({
      content: (
        <div className={styles.multipleItemsInSection}>
          <h2>Banking Details</h2>
          {allBankData}
        </div>
      ),
    });
  }

  return (
    <div className={styles.pageContainer}>
      <HeaderBreadcrumb title="Profile" />
      <HeaderPolicyDetails />
      <ClickableCardContainer listItems={[...listItems]}>
        <div>
          <h2 className="mb-lg">Name</h2>
          <FieldData Label={<Label>Owner</Label>}>
            <p className="typography-content-body-sm">
              {fullName({
                firstName: profileData?.name?.firstName,
                lastName: profileData?.name?.lastName,
              })}
            </p>
          </FieldData>
        </div>
      </ClickableCardContainer>
    </div>
  );
}
