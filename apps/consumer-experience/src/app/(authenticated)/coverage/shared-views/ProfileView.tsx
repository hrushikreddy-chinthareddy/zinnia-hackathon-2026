import { Email, LineOfBusiness, Phone } from '@zinnia/api-types/types/sor';
import { Label } from '@zinnia/bloom/components';

import { AddressList } from '@/components/address-list/AddressList';
import { BankList } from '@/components/bank-list/BankList';
import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { CommunicationPreferences } from '@/components/communication-preferences/CommunicationPreferences';
import { FieldData } from '@/components/field-data/FieldData';
import { Emails } from '@/components/person-data/Emails';
import { Phones } from '@/components/person-data/Phones';
import { FullName } from '@/components/pii/FullName';
import { getFeatureFlags } from '@/services/feature-flags';
import { getPreferencesByPlanCode } from '@/services/preferences/v1/[partyId]/e-delivery/[planCode]/[policyNumber]';
import { PolicyProfile } from '@/types/policy';
import { filterItemsWithPastEndDate } from '@/utils/data';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

export const ProfileView = async ({
  lineOfBusiness,
  profileData,
  planCode,
  policyNumber,
}: {
  lineOfBusiness: LineOfBusiness;
  profileData: PolicyProfile;
  planCode: string;
  policyNumber: string;
}) => {
  const flags = await getFeatureFlags();

  const showCommunicationPreferences =
    flags?.[FEATURE_FLAGS.COMMUNICATION_PREFERENCES];
  const allowBankingChanges =
    flags?.[FEATURE_FLAGS.ADD_EDIT_DELETE_BANK_ACCOUNT] || false;
  const allowAddressChanges = flags?.[FEATURE_FLAGS.ADD_EDIT_DELETE_ADDRESS];

  const { data: preferencesData } = await getPreferencesByPlanCode({
    planCode,
    policyNumber,
  });

  const addresses = () => {
    return (
      <AddressList
        planCode={planCode}
        policyNumber={policyNumber}
        initialProfileData={profileData}
        allowAddressChanges={allowAddressChanges}
        lineOfBusiness={lineOfBusiness}
      />
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

  const communicationPreferences = () => {
    // The api returns an array of preferences, instead of a single object per the api spec
    if (preferencesData) {
      return (
        <CommunicationPreferences
          preferenceData={preferencesData}
          profileData={profileData}
        />
      );
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
        lineOfBusiness={lineOfBusiness}
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
        {showCommunicationPreferences && communicationPreferences()}
        {bank()}
      </div>
    </div>
  );
};
