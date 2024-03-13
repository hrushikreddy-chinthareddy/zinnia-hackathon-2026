import { Address, Email } from '@zinnia/api-types/types/sor';
import { Label } from '@zinnia/bloom/internal/components';

import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';
import { Addresses } from '@/components/person-data/Addresses';
import { Emails } from '@/components/person-data/Emails';
import { beneficiary as beneData } from '@/services/mocks/beneficiary';
import {
  isNullEmptyOrUndefined,
  filterItemsWithPastEndDate,
  fullName,
} from '@/utils/data';
import { toSentenceCase } from '@/utils/strings';

export default async function Beneficiary() {
  const listItems = [];

  if (!isNullEmptyOrUndefined(beneData.beneficiaryPercentage)) {
    listItems.push({
      content: (
        <div>
          <h2 className="mb-lg">Allocation</h2>
          <p className="typography-content-value">{`${beneData.beneficiaryPercentage}%`}</p>
        </div>
      ),
    });
  }

  // TODO: do benes show preferredAddressIndicator?
  if (beneData.addresses) {
    const currentAddresses = filterItemsWithPastEndDate(beneData.addresses);

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

  if (beneData.emails) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentEmails = filterItemsWithPastEndDate(beneData.emails as any);

    if (currentEmails.length > 0) {
      listItems.push({
        content: <Emails emails={currentEmails as Email[]} title="Email" />,
      });
    }
  }

  return (
    <div>
      <HeaderBreadcrumb title="Beneficiary" />
      <HeaderPolicyDetails />
      <ClickableCardContainer listItems={listItems}>
        <div>
          <h2 className="mb-lg">Name</h2>
          <FieldData
            Label={
              <Label>{`${toSentenceCase(beneData.partyType)} ${beneData.partyType ? 'beneficiary' : ''}`}</Label>
            }
          >
            <p className="typography-content-body-sm">
              {fullName({
                firstName: beneData.firstName,
                lastName: beneData.lastName,
              })}
            </p>
          </FieldData>
        </div>
      </ClickableCardContainer>
    </div>
  );
}
