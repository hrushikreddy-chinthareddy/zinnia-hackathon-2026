import { LineOfBusiness, PartyRole } from '@zinnia/api-types/types/sor';
import {
  AllocationColorBar,
  contingentColorOrder,
  Icon,
  IconType,
  primaryColorOrder,
} from '@zinnia/bloom/components';

import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { LabelPopover } from '@/components/label-popover/LabelPopover';
import { Party } from '@/components/party-list/PartyList';
import { Beneficiary, PolicyParty } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';

import styles from './BeneficiariesView.module.css';

const BeneficiaryListItem = ({
  beneficiary,
  index,
  type,
}: {
  beneficiary: Beneficiary;
  index: number;
  type: PartyRole;
}) => {
  const colorArray =
    type === PartyRole.CONTINGENTBENEFICIARY
      ? contingentColorOrder
      : primaryColorOrder;
  const beneficiaryParty: PolicyParty = {
    partyId: beneficiary.partyId,
    firstName: beneficiary.firstName,
    lastName: beneficiary.lastName,
    addresses: beneficiary.addresses,
    phones: beneficiary.phones,
    emails: beneficiary.emails,
    partyRoles: [beneficiary.partyRole],
    partyType: beneficiary.partyType,
  };

  return (
    <div className={styles.allocationItem}>
      <p className="typography-labels-label-sm">
        <Party key={beneficiary.partyId} party={beneficiaryParty} />
      </p>
      <div className={styles.allocationDetails}>
        <span
          aria-hidden
          className={styles.colorBlock}
          style={{ backgroundColor: colorArray[index] }}
        ></span>
        <p className="typography-content-value">{`${beneficiary?.beneficiaryPercentage}%`}</p>
      </div>
    </div>
  );
};

export async function BeneficiariesView({
  data,
  lineOfBusiness,
}: {
  data: {
    totalCoverageAmount: number | null | undefined;
    beneficiaries:
      | {
          primary: Beneficiary[];
          contingent: Beneficiary[];
        }
      | undefined;
  };
  lineOfBusiness: LineOfBusiness;
}) {
  const groupedBenes = data?.beneficiaries;

  return (
    <div className="container">
      {lineOfBusiness === LineOfBusiness.ANNUITY && (
        <p className="typography-content-body-sm">
          You’re covered for{' '}
          <span style={{ fontWeight: 600 }}>
            {formatUSDollars(data?.totalCoverageAmount)}
          </span>
          . That means if you die while your policy is active (and you're in
          compliance with all policy requirements) your beneficiaries will
          receive this amount, plus any additional account value and minus
          outstanding loans, withdrawals or other interest calculations, if
          applicable.
        </p>
      )}

      {!groupedBenes && (
        <ClickableCardContainer>
          Beneficiary data unavailable at this time. Please try again later.
        </ClickableCardContainer>
      )}

      {groupedBenes && groupedBenes.primary.length > 0 && (
        <div className={styles.allocationContainer}>
          <div className={styles.allocationHeader}>
            <div className={styles.allocationHeaderText}>
              <Icon type={IconType.USER_GROUP} />
              <h2 className="typography-labels-label-md">Primary allocation</h2>
              <LabelPopover title="Primary allocation">
                <p>
                  Your primary allocation tells us how to split up the money
                  between primary beneficiaries, who will receive payment
                  according to your contract terms, should you die.
                </p>
              </LabelPopover>
            </div>
            <AllocationColorBar
              type="primary"
              allocations={groupedBenes?.primary?.map(
                primary => primary.beneficiaryPercentage
              )}
            />
          </div>
          <ul>
            {groupedBenes.primary.map((bene, index) => (
              <li key={index}>
                <BeneficiaryListItem
                  beneficiary={bene}
                  index={index}
                  type={bene.partyRole}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {groupedBenes && groupedBenes.contingent.length > 0 && (
        <div className={styles.allocationContainer}>
          <div className={styles.allocationHeader}>
            <div className={styles.allocationHeaderText}>
              <Icon type={IconType.USER_GROUP} />
              <h2 className="typography-labels-label-md">
                Contingent allocation
              </h2>
              <LabelPopover title="Contingent allocation">
                <p>
                  Your contingent allocation tells us how to split up the money
                  between contingent beneficiaries, if needed. Contingent
                  beneficiaries will receive payment from your death benefit
                  only if your primary beneficiaries have died.
                </p>
              </LabelPopover>
            </div>
            <AllocationColorBar
              type="contingent"
              allocations={groupedBenes.contingent.map(
                contingents => contingents.beneficiaryPercentage
              )}
            />
          </div>
          <ul>
            {groupedBenes.contingent.map((bene, index) => (
              <li key={index}>
                <BeneficiaryListItem
                  beneficiary={bene}
                  index={index}
                  type={bene.partyRole}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
      <CallForAssistance
        callToAction="Updating beneficiaries is coming soon. For now,"
        contactPrompt="call"
        customInstruction=" to make changes."
      />
    </div>
  );
}
