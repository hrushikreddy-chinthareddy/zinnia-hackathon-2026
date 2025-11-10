import { EDeliveryPreferenceModel } from '@zinnia/api-types/types/preferences';
import { Email, LineOfBusiness, Phone } from '@zinnia/api-types/types/sor';
import { Label } from '@zinnia/bloom/components';

import AccordionDetails from '@/components/accordion-details/AccordionDetails';
import { AddressList } from '@/components/address-list/AddressList';
import { BankList } from '@/components/bank-list/BankList';
import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { CommunicationPreferences } from '@/components/communication-preferences/CommunicationPreferences';
import { PaymentDetails } from '@/components/farmers/payment-details/PaymentDetails';
import { FieldData } from '@/components/field-data/FieldData';
import { PartyList } from '@/components/party-list/PartyList';
import { Emails } from '@/components/person-data/Emails';
import { Phones } from '@/components/person-data/Phones';
import { FullName } from '@/components/pii/FullName';
import { getCarrierConfig } from '@/services/carrier-config';
import { getComponentVisibility } from '@/services/display-rules';
import { ComponentName } from '@/services/display-rules/types';
import { getFeatureFlags } from '@/services/feature-flags';
import { getPreferencesByPlanCode } from '@/services/preferences/v1/[partyId]/e-delivery/[planCode]/[policyNumber]';
import { PaymentProvider } from '@/types/carrier-config';
import { PolicyProfile } from '@/types/policy';
import { filterItemsWithPastEndDate } from '@/utils/data';
import { buildCommonLogContext } from '@/utils/logging/server-logging';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';
import {
  filterPayorViewParties,
  filterOutCoverageInsuredParties,
  formatPartyRoles,
  filterOutEndDatedParties,
} from '@/utils/party';

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
  const commonLoggingContext = await buildCommonLogContext();
  const showCommunicationPreferences =
    flags?.[FEATURE_FLAGS.COMMUNICATION_PREFERENCES];
  const allowBankingChanges =
    flags?.[FEATURE_FLAGS.ADD_EDIT_DELETE_BANK_ACCOUNT] || false;
  const showFarmersPaymentus =
    flags?.[FEATURE_FLAGS.FARMERS_PAYMENTUS] || false;
  const showParties = flags?.[FEATURE_FLAGS.POLICY_OWNER_PROFILE_PARTIES];
  const { data } = await getCarrierConfig(commonLoggingContext);

  let preferencesData = [] as EDeliveryPreferenceModel[];
  const loggingContext = await buildCommonLogContext();

  if (showCommunicationPreferences) {
    const { data } = await getPreferencesByPlanCode(
      {
        planCode,
        policyNumber,
      },
      loggingContext
    );

    preferencesData = data;
  }

  const addresses = () => {
    return (
      <AddressList
        planCode={planCode}
        policyNumber={policyNumber}
        initialProfileData={profileData}
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
    return (
      <CommunicationPreferences
        preferenceData={preferencesData}
        profileData={profileData}
      />
    );
  };

  const bank = () => {
    if (
      data?.payment.provider === PaymentProvider.PAYMENTUS &&
      showFarmersPaymentus
    ) {
      return (
        <PaymentDetails
          verifyIdentityRequired={data?.payment.verifyIdentityRequired}
          policyNumber={policyNumber}
          planCode={planCode}
        />
      );
    }

    return (
      <>
        <BankList
          planCode={planCode}
          policyNumber={policyNumber}
          allowBankingChanges={allowBankingChanges}
          initialProfileData={profileData}
          lineOfBusiness={lineOfBusiness}
          verifyIdentityRequired={data?.payment.verifyIdentityRequired}
        />
      </>
    );
  };

  const parties = async () => {
    const { parties, partyRoles } = profileData;
    const loggingCtx = await buildCommonLogContext();
    const { data: visibility } = await getComponentVisibility(
      { policyNumber, planCode },
      loggingCtx
    );
    const hasPayorView =
      visibility?.[ComponentName.PROFILE_PAYOR_PARTY_ROLES]();

    if (!parties) {
      return null;
    }

    // If payor view is enabled, only show parties with PAYOR, OWNER, or JOINTOWNER roles
    const initialFiltered = hasPayorView
      ? filterPayorViewParties(parties)
      : parties;

    // Filter out parties on the basis of their partyRole endDate
    const activeParties = filterOutEndDatedParties(
      initialFiltered,
      partyRoles || []
    );

    // Remove parties that only have COVERAGEINSURED role (or filter out COVERAGEINSURED from mixed roles)
    const filteredParties = filterOutCoverageInsuredParties(activeParties);

    return (
      <AccordionDetails
        items={[
          {
            value: 'policy-parties',
            trigger: (
              <span className="typography-content-body-sm-bold">
                People on this policy
              </span>
            ),
            content: <PartyList parties={filteredParties} />,
          },
        ]}
      />
    );
  };

  const loggedInParty = profileData.parties.find(
    party => party.partyId === profileData.partyId
  );
  const roles = formatPartyRoles(loggedInParty?.partyRoles);

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
          <FieldData Label={<Label>{roles}</Label>}>
            <p className="typography-content-body-sm">
              <FullName
                firstName={profileData?.name?.firstName}
                lastName={profileData?.name?.lastName}
              />
            </p>
          </FieldData>
          {showParties && parties()}
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
