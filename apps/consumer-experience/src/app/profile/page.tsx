import { Label } from '@zinnia/bloom/internal/components';

import { BankData } from '@/components/bank-data/BankData';
import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';
import { Addresses } from '@/components/person-data/Addresses';
import { Emails } from '@/components/person-data/Emails';
import { Phones } from '@/components/person-data/Phones';
import {
  Address,
  BankDetails,
  Email,
  Phone,
} from '@/components/person-data/types';
import { baseAppUrl } from '@/services/api-config';
import { serverApi } from '@/services/server';
import { filterItemsWithPastEndDate, fullName } from '@/utils/data';

import styles from './Profile.module.css';

export default async function Profile() {
  const data = await Promise.allSettled([
    serverApi.get(`${baseAppUrl}/api/profile`),
    // TODO: is this how we actually want to do this?
    serverApi.get(`${baseAppUrl}/api/policies/2345`),
  ]);

  const profileResult = data?.[0];
  const policyResult = data?.[1];

  const profileData =
    profileResult?.status === 'fulfilled' ? profileResult.value?.data : {};

  const policyHeaderData =
    policyResult?.status === 'fulfilled'
      ? policyResult.value?.data?.policyDetails
      : {};

  const listItems = [];

  if (profileData.addresses) {
    const currentAddresses = filterItemsWithPastEndDate(profileData.addresses);

    if (currentAddresses) {
      listItems.push({
        content: (
          <Addresses
            addresses={currentAddresses as Address[]}
            title="Address"
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
    const allBankData = profileData.bankDetails.map(
      (bankDetail: BankDetails) => {
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
      }
    );

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
      {Object.keys(profileData).length === 0 && (
        <ClickableCardContainer>
          <div>No data available</div>
        </ClickableCardContainer>
      )}

      {Object.keys(profileData).length > 0 && (
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
      )}
    </div>
  );
}
