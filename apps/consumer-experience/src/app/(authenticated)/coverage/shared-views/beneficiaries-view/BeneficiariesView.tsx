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
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
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
    fullName: beneficiary.fullName,
    addresses: beneficiary.addresses,
    phones: beneficiary.phones,
    emails: beneficiary.emails,
    partyRoles: [beneficiary.partyRole],
    partyType: beneficiary.partyType,
    allocationPercentage: beneficiary.beneficiaryPercentage,
  };

  return (
    <div className={styles.allocationItem}>
      <div className="typography-labels-label-sm">
        <Party key={beneficiary.partyId} party={beneficiaryParty} />
      </div>
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

type BeneficiaryType = 'Primary' | 'Contingent';
const Header = ({
  children,
  type,
}: {
  children?: React.ReactNode;
  type: 'Primary' | 'Contingent';
}) => {
  if (!type) {
    return <NoDataAvailable />;
  }
  const TooltipCopy: Record<
    BeneficiaryType,
    { title: string; description: string }
  > = {
    Primary: {
      title: 'Primary Allocation',
      description:
        'Your primary allocation tells us how to split up the money between primary beneficiaries, who will receive payment according to your contract terms, should you die.',
    },
    Contingent: {
      title: 'Contingent Allocation',
      description:
        'Your contingent allocation tells us how to split up the money between contingent beneficiaries, who will receive payment according to your contract terms, should you die and your primary beneficiaries have died.',
    },
  };

  const { title, description } = TooltipCopy[type];

  return (
    <figure className={styles.allocationHeader}>
      <div className={styles.allocationHeaderText}>
        <Icon type={IconType.USER_GROUP} />
        <figcaption className="typography-labels-label-md">{title}</figcaption>
        <LabelPopover title="Primary allocation">
          <p>{description}</p>
        </LabelPopover>
      </div>
      {children}
    </figure>
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
          <Header type="Primary">
            <AllocationColorBar
              type="primary"
              allocations={groupedBenes?.primary?.map(
                primary => primary.beneficiaryPercentage
              )}
            />
          </Header>
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
          <Header type="Contingent">
            <AllocationColorBar
              type="contingent"
              allocations={groupedBenes.contingent.map(
                contingents => contingents.beneficiaryPercentage
              )}
            />
          </Header>

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

BeneficiariesView.Header = Header;
