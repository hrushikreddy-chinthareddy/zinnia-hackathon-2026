import { QueryClient } from '@tanstack/react-query';
import { Address, Email, Phone } from '@zinnia/api-types/types/sor';
import { IconType, Label } from '@zinnia/bloom/components';
import { Metadata } from 'next';

import { AddEditAddressSidesheet } from '@/components/add-edit-address/AddEditAddressSidesheet';
import { BankList } from '@/components/bank-list/BankList';
import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { FieldData } from '@/components/field-data/FieldData';
import MockMessage from '@/components/MockMessage';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { Addresses } from '@/components/person-data/Addresses';
import { Emails } from '@/components/person-data/Emails';
import { Phones } from '@/components/person-data/Phones';
import { FullName } from '@/components/pii/FullName';
import { QueryKeys } from '@/queries/query-keys';
import { getPageTitle, RouteKey } from '@/route-map';
import { getPolicyProfileData } from '@/services';
import { getFeatureFlags } from '@/services/feature-flags';
import { PolicyRequestInputs } from '@/types/policy';
import { filterItemsWithPastEndDate } from '@/utils/data';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

const pageTitle = getPageTitle(RouteKey.PROFILE);
// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

interface Props {
  params: PolicyRequestInputs;
}

export default async function Profile({ params }: Props) {
  const { data, error } = await getPolicyProfileData({
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });
  const queryClient = new QueryClient();

  queryClient.setQueryData([QueryKeys.POLICY_PROFILE], data);

  const flags = await getFeatureFlags();
  const allowBankingChanges =
    flags?.[FEATURE_FLAGS.ADD_EDIT_DELETE_BANK_ACCOUNT];

  if (error) {
    return (
      <div className="space-mb-gap-lg">
        <MockMessage />
        <NoDataAvailable
          iconType={IconType.CIRCLE_USER}
          message="There is currently no profile data available."
        />
      </div>
    );
  }

  const profileData = data!;

  const addresses = () => {
    if (profileData.addresses && profileData.addresses.length) {
      const currentAddresses = filterItemsWithPastEndDate(
        profileData.addresses
      );

      if (currentAddresses && currentAddresses.length) {
        return (
          <Addresses
            addresses={currentAddresses as Address[]}
            title="Address"
            preferredAddressIndicator={profileData.preferredAddressIndicator}
            partyId={profileData.partyId}
          />
        );
      }
    }
    // If there are no addresses, show the add address button and set defaultAddress to true
    return (
      <>
        <h2 className="mb-lg">Addresses</h2>
        <AddEditAddressSidesheet
          values={{ defaultAddress: true }}
          partyId={profileData.partyId || ''}
        />
      </>
    );
  };

  const phone = () => {
    if (profileData.phones && profileData.phones.length) {
      const currentPhones = filterItemsWithPastEndDate(profileData.phones);

      if (currentPhones) {
        return <Phones phones={currentPhones as Phone[]} title="Phone" />;
      }
    }

    return null;
  };

  const email = () => {
    if (profileData.emails && profileData.emails.length) {
      const currentEmails = filterItemsWithPastEndDate(profileData.emails);

      if (currentEmails) {
        return <Emails emails={currentEmails as Email[]} title="Email" />;
      }
    }

    return null;
  };

  const bank = () => {
    return (
      <BankList
        planCode={params.planCode}
        policyNumber={params.policyNumber}
        allowBankingChanges={allowBankingChanges}
        initialProfileData={data}
      />
    );
  };

  return (
    <div>
      <CallForAssistance
        callToAction="The ability to edit contact info is coming soon."
        contactPrompt="For now, call"
        customInstruction="to make changes."
      />
      <div className="info-card-container">
        <div>
          <h2 className="mb-lg">Name</h2>
          <FieldData Label={<Label>Annuitant</Label>}>
            <p className="typography-content-body-sm">
              <FullName
                firstName={profileData?.name?.firstName}
                lastName={profileData?.name?.lastName}
              />
            </p>
          </FieldData>
        </div>

        {addresses()}
        {phone()}
        {email()}
        {bank()}
      </div>
    </div>
  );
}
