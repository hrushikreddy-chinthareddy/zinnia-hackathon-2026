import { Address, Email, PartyRole } from '@zinnia/api-types/types/sor';
import { IconType, Label } from '@zinnia/bloom/components';
import { Metadata } from 'next';

import { AddEditAddressSidesheet } from '@/components/add-edit-address/AddEditAddressSidesheet';
import { FormActionType } from '@/components/add-edit-address/types';
import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { FieldData } from '@/components/field-data/FieldData';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { Addresses } from '@/components/person-data/Addresses';
import { Emails } from '@/components/person-data/Emails';
import { FullName } from '@/components/pii/FullName';
import { Name } from '@/components/pii/Name';
import { RouteKey, getPageTitle } from '@/route-map';
import { getBeneficiary } from '@/services/policy';
import {
  isNullEmptyOrUndefined,
  filterItemsWithPastEndDate,
} from '@/utils/data';
import { buildCommonLogContext } from '@/utils/logging/server-logging';
import { toSentenceCase } from '@/utils/strings';

const pageTitle = getPageTitle(RouteKey.BENEFICIARY);
// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

const beneDisplayText: { [key in PartyRole]?: string } = {
  [PartyRole.CONTINGENTBENEFICIARY]: 'contingent',
  [PartyRole.PRIMARYBENEFICIARY]: 'primary',
};

export default async function Beneficiary({
  params,
}: {
  params: {
    planCode: string;
    policyNumber: string;
    beneficiary: string;
  };
}) {
  const planCode = params.planCode || '';
  const policyNumber = params.policyNumber || '';
  const partyId = params.beneficiary || '';

  const loggingContext = await buildCommonLogContext();

  const { data, error } = await getBeneficiary(
    {
      planCode,
      policyNumber,
      partyId,
    },
    loggingContext
  );

  if (error || !data) {
    return (
      <div className="container">
        <NoDataAvailable
          iconType={IconType.CIRCLE_USER}
          message="There is currently no beneficiary data available."
          correlationId={error?.correlationId}
        />
      </div>
    );
  }

  // TODO: do benes show preferredAddressIndicator?
  const address = () => {
    if (data.addresses) {
      const currentAddresses = filterItemsWithPastEndDate(data.addresses);

      if (currentAddresses.length > 0) {
        return (
          <div>
            <h2 className="mb-lg">Address</h2>
            <Addresses
              addresses={currentAddresses as Address[]}
              partyId={partyId}
            />
          </div>
        );
      }
    }

    // If there are no addresses, show the add address button and set defaultAddress to true
    return (
      <>
        <h2 className="mb-lg">Addresses</h2>
        <AddEditAddressSidesheet
          values={{ defaultAddress: true }}
          partyId={partyId}
          actionType={FormActionType.ADD}
        />
      </>
    );
  };

  const email = () => {
    if (data.emails) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const currentEmails = filterItemsWithPastEndDate(data.emails as any);

      if (currentEmails.length > 0) {
        return <Emails emails={currentEmails as Email[]} title="Email" />;
      }
    }

    return null;
  };

  const beneficiaryTitle = `${toSentenceCase(beneDisplayText[data.partyRole])} ${beneDisplayText[data.partyRole] ? 'beneficiary' : ''}`;

  return (
    <div className="container">
      <div className="info-card-container">
        <div>
          <h2 className="mb-lg">Name</h2>
          <FieldData
            Label={<Label>{<Name displayName={beneficiaryTitle} />}</Label>}
          >
            <p className="typography-content-body-sm">
              <FullName firstName={data.firstName} lastName={data.lastName} />
            </p>
          </FieldData>
        </div>
        {!isNullEmptyOrUndefined(data.beneficiaryPercentage) && (
          <div>
            <h2 className="mb-lg">Allocation</h2>
            <p className="typography-content-value">{`${data.beneficiaryPercentage}%`}</p>
          </div>
        )}
        {address()}
        {email()}
      </div>
      <CallForAssistance
        callToAction="Updating beneficiaries is coming soon. For now,"
        contactPrompt="call"
        customInstruction=" to make changes."
      />
    </div>
  );
}
