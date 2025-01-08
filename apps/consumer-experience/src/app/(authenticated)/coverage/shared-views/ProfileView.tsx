import { Address, Email, Phone } from '@zinnia/api-types/types/sor';
import { Label } from '@zinnia/bloom/components';

import { AddEditAddressSidesheet } from '@/components/add-edit-address/AddEditAddressSidesheet';
import { FormActionType } from '@/components/add-edit-address/types';
import { BankList } from '@/components/bank-list/BankList';
import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { FieldData } from '@/components/field-data/FieldData';
import { Addresses } from '@/components/person-data/Addresses';
import { Emails } from '@/components/person-data/Emails';
import { Phones } from '@/components/person-data/Phones';
import { FullName } from '@/components/pii/FullName';
import { getFeatureFlags } from '@/services/feature-flags';
import { PolicyProfile } from '@/types/policy';
import { filterItemsWithPastEndDate } from '@/utils/data';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

export const ProfileView = async ({
  profileData,
  planCode,
  policyNumber,
}: {
  profileData: PolicyProfile;
  planCode: string;
  policyNumber: string;
}) => {
  const flags = await getFeatureFlags();
  const allowBankingChanges =
    flags?.[FEATURE_FLAGS.ADD_EDIT_DELETE_BANK_ACCOUNT];

  const allowAddressChanges = flags?.[FEATURE_FLAGS.ADD_EDIT_DELETE_ADDRESS];

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
            allowAddressChanges={allowAddressChanges}
          />
        );
      }
    }

    if (!allowAddressChanges) {
      return null;
    }
    // If there are no addresses, show the add address button and set defaultAddress to true
    return (
      <>
        <h2 className="mb-lg">Addresses</h2>
        <AddEditAddressSidesheet
          values={{ defaultAddress: true }}
          partyId={profileData.partyId}
          actionType={FormActionType.ADD}
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
        planCode={planCode}
        policyNumber={policyNumber}
        allowBankingChanges={allowBankingChanges}
        initialProfileData={profileData}
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
          <FieldData Label={<Label>Owner</Label>}>
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
};
