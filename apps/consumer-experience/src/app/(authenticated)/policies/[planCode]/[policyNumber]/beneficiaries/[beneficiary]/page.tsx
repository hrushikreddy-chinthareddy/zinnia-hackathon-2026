import { Address, Email, PartyRole } from '@zinnia/api-types/types/sor';
import { IconType, Label } from '@zinnia/bloom/internal/components';
import { Metadata } from 'next';

import { FieldData } from '@/components/field-data/FieldData';
import MockMessage from '@/components/MockMessage';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { Addresses } from '@/components/person-data/Addresses';
import { Emails } from '@/components/person-data/Emails';
import { RouteKey, getPageTitle } from '@/route-map';
import { getBeneficiary } from '@/services/policy';
import {
  isNullEmptyOrUndefined,
  filterItemsWithPastEndDate,
  fullName,
} from '@/utils/data';
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

  const { data, error } = await getBeneficiary({
    planCode,
    policyNumber,
    partyId,
  });

  if (error || !data) {
    return (
      <div className="container">
        <MockMessage />
        <NoDataAvailable
          iconType={IconType.CIRCLE_USER}
          message="There is currently no beneficiary data available."
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
          <Addresses
            addresses={currentAddresses as Address[]}
            title="Address"
            preferredAddressIndicator="1"
          />
        );
      }

      return null;
    }
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

  return (
    <div className="container">
      <div className="info-card-container">
        <div>
          <h2 className="mb-lg">Name</h2>
          <FieldData
            Label={
              <Label>{`${toSentenceCase(beneDisplayText[data.partyRole])} ${beneDisplayText[data.partyRole] ? 'beneficiary' : ''}`}</Label>
            }
          >
            <p className="typography-content-body-sm">
              {fullName({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
              })}
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
    </div>
  );
}
