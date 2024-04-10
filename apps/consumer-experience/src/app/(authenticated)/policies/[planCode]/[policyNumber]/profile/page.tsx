import { Address, Email, Phone } from '@zinnia/api-types/types/sor';
import { IconType, Label } from '@zinnia/bloom/internal/components';

import { BankData } from '@/components/bank-data/BankData';
import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';
import MockMessage from '@/components/MockMessage';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { Addresses } from '@/components/person-data/Addresses';
import { Emails } from '@/components/person-data/Emails';
import { Phones } from '@/components/person-data/Phones';
import { getPolicyProfileData } from '@/services';
import { PolicyRequestInputs } from '@/types/policy';
import { filterItemsWithPastEndDate, fullName } from '@/utils/data';

import styles from './Profile.module.css';

interface Props {
  params: PolicyRequestInputs;
}

export default async function Profile({ params }: Props) {
  const { data, error } = await getPolicyProfileData({
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <HeaderBreadcrumb title="Profile" />
        <HeaderPolicyDetails
          policyNumber={params.policyNumber}
          planCode={params.planCode}
        />
        <div className="space-mb-gap-lg">
          <MockMessage />
          <NoDataAvailable
            iconType={IconType.CIRCLE_USER}
            message="There is currently no profile data available."
          />
        </div>
      </div>
    );
  }

  const listItems = [];
  const profileData = data!;
  if (profileData.addresses && profileData.addresses.length) {
    const currentAddresses = filterItemsWithPastEndDate(profileData.addresses);

    if (currentAddresses && currentAddresses.length) {
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

  if (profileData.phones && profileData.phones.length) {
    const currentPhones = filterItemsWithPastEndDate(profileData.phones);

    if (currentPhones) {
      listItems.push({
        content: <Phones phones={currentPhones as Phone[]} title="Phone" />,
      });
    }
  }

  if (profileData.emails && profileData.emails.length) {
    const currentEmails = filterItemsWithPastEndDate(profileData.emails);

    if (currentEmails) {
      listItems.push({
        content: <Emails emails={currentEmails as Email[]} title="Email" />,
      });
    }
  }

  if (profileData.bankDetails && profileData.bankDetails.length) {
    const allBankData = profileData.bankDetails.map(bankDetail => {
      return <BankData key={bankDetail.accountNumber} {...bankDetail} />;
    });

    listItems.push({
      content: (
        <div className={styles.multipleItemsInSection}>
          <h2 className="mb-lg">Banking Details</h2>
          {allBankData}
        </div>
      ),
    });
  }

  return (
    <div className="container">
      <HeaderBreadcrumb title="Profile" />
      <HeaderPolicyDetails
        policyNumber={params.policyNumber}
        planCode={params.planCode}
      />
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
      <CallForAssistance />
      <Footer />
    </div>
  );
}
