import { Address, Email, PartyRole } from '@zinnia/api-types/types/sor';
import { IconType, Label } from '@zinnia/bloom/internal/components';

import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import MockMessage from '@/components/MockMessage';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { Addresses } from '@/components/person-data/Addresses';
import { Emails } from '@/components/person-data/Emails';
import { getBeneficiary } from '@/services/policy';
import {
  isNullEmptyOrUndefined,
  filterItemsWithPastEndDate,
  fullName,
} from '@/utils/data';
import { toSentenceCase } from '@/utils/strings';

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
      <div>
        <HeaderBreadcrumb title="Beneficiaries" />
        <div className="space-mb-gap-lg">
          <MockMessage />
          <NoDataAvailable
            iconType={IconType.CIRCLE_USER}
            message="There is currently no beneficiary data available."
          />
        </div>
      </div>
    );
  }

  const listItems = [];

  if (!isNullEmptyOrUndefined(data.beneficiaryPercentage)) {
    listItems.push({
      content: (
        <div>
          <h2 className="mb-lg">Allocation</h2>
          <p className="typography-content-value">{`${data.beneficiaryPercentage}%`}</p>
        </div>
      ),
    });
  }

  // TODO: do benes show preferredAddressIndicator?
  if (data.addresses) {
    const currentAddresses = filterItemsWithPastEndDate(data.addresses);

    if (currentAddresses.length > 0) {
      listItems.push({
        content: (
          <Addresses
            addresses={currentAddresses as Address[]}
            title="Address"
            preferredAddressIndicator="1"
          />
        ),
      });
    }
  }

  if (data.emails) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentEmails = filterItemsWithPastEndDate(data.emails as any);

    if (currentEmails.length > 0) {
      listItems.push({
        content: <Emails emails={currentEmails as Email[]} title="Email" />,
      });
    }
  }

  return (
    <div>
      <HeaderBreadcrumb title="Beneficiary" />

      <ClickableCardContainer listItems={listItems}>
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
      </ClickableCardContainer>
    </div>
  );
}
