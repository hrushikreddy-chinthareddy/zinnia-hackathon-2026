import { PartyRole } from '@zinnia/api-types/types/sor';
import {
  AllocationColorBar,
  Icon,
  IconType,
  Popover,
  contingentColorOrder,
  primaryColorOrder,
} from '@zinnia/bloom/internal/components';
import { Suspense } from 'react';

import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';
import { InfoCard } from '@/components/info-card/InfoCard';
import MockMessage from '@/components/MockMessage';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { getBeneficiaries } from '@/services/policy';
import { Beneficiary } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';
import { fullName } from '@/utils/data';

import styles from './Beneficiaries.module.css';

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

  return (
    <div className={styles.allocationItem}>
      <p className="typography-labels-label-sm">
        {fullName({
          firstName: beneficiary.firstName || '',
          lastName: beneficiary.lastName || '',
        })}
      </p>
      <div className={styles.allocationDetails}>
        <span
          aria-hidden
          className={styles.colorBlock}
          style={{ backgroundColor: colorArray[index] }}
        ></span>
        <p className="typography-content-value">{`${beneficiary.beneficiaryPercentage}%`}</p>
      </div>
    </div>
  );
};

export default async function Beneficiaries({
  params,
}: {
  params: {
    planCode: string;
    policyNumber: string;
  };
}) {
  const planCode = params.planCode || '';
  const policyNumber = params.policyNumber || '';

  const { data, error } = await getBeneficiaries({
    planCode,
    policyNumber,
  });

  const groupedBenes = data?.beneficiaries?.reduce(
    (grouped, bene) => {
      if (
        bene.partyRole === PartyRole.PRIMARYBENEFICIARY &&
        bene.beneficiaryPercentage &&
        bene.beneficiaryPercentage > 0
      ) {
        grouped.primary.push(bene);
      }

      if (
        bene.partyRole === PartyRole.CONTINGENTBENEFICIARY &&
        bene.beneficiaryPercentage &&
        bene.beneficiaryPercentage > 0
      ) {
        grouped.contingent.push(bene);
      }

      return grouped;
    },
    { primary: [] as Beneficiary[], contingent: [] as Beneficiary[] }
  );

  const beneListItems = (beneGroup: Beneficiary[]) =>
    beneGroup?.map((bene: Beneficiary, index: number) => {
      return {
        linkTo: {
          // For now using partyId here to identify the beneficiary, but it's not the best look from a consumer standpoint
          url: `/policies/${planCode}/${policyNumber}/beneficiaries/${bene.partyId}`,
          label: `go to primary beneficiary ${bene.firstName} ${bene.lastName} profile page`,
        },
        content: (
          <BeneficiaryListItem
            beneficiary={bene}
            index={index}
            type={bene.partyRole}
          />
        ),
      };
    });

  if (error || data?.beneficiaries?.length === 0) {
    return (
      <div>
        <HeaderBreadcrumb title="Beneficiaries" />
        <HeaderPolicyDetails
          planCode={planCode}
          policyNumber={policyNumber}
          className={styles.policyDetails}
        />
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

  return (
    <div className="container">
      <Suspense fallback={<div style={{ height: '100vh' }}>Loading...</div>}>
        <HeaderBreadcrumb title="Beneficiaries" />
        <HeaderPolicyDetails
          planCode={planCode}
          policyNumber={policyNumber}
          className={styles.policyDetails}
        />
        <div className="card-container">
          <InfoCard iconType={IconType.LIGHTBULB}>
            <>
              You’re covered for{' '}
              <span style={{ fontWeight: 600 }}>
                {formatUSDollars(data?.totalCoverageAmount)}
              </span>
              . That means if you die while your policy is active your
              beneficiaries will receive this amount (minus outstanding loans
              and applicable interest calculations), according to your
              allocations.
            </>
          </InfoCard>

          {!groupedBenes && (
            <ClickableCardContainer>
              Beneficiary data unavailable at this time. Please try again later.
            </ClickableCardContainer>
          )}

          {groupedBenes && groupedBenes.primary.length > 0 && (
            <ClickableCardContainer
              listItems={[...beneListItems(groupedBenes.primary)]}
            >
              <div className={styles.allocationContainer}>
                <div className={styles.allocationHeader}>
                  <Icon type={IconType.USER_GROUP} />
                  <h2 className="typography-labels-label-md">
                    Primary allocation
                  </h2>
                  <Popover
                    trigger={
                      <Icon
                        type={IconType.CIRCLE_INFO}
                        width={16}
                        height={16}
                        color="var(--color-base-icon-icon-tooltip, #ff7500)"
                      />
                    }
                    title="Primary allocation"
                  >
                    <p>
                      Your primary allocation tells us how to split up the money
                      between primary beneficiaries after you die. Your primary
                      beneficiaries are first in line to receive payment from
                      your coverage.
                    </p>
                  </Popover>
                </div>
                <AllocationColorBar
                  type="primary"
                  allocations={groupedBenes?.primary?.map(
                    primary => primary.beneficiaryPercentage
                  )}
                />
              </div>
            </ClickableCardContainer>
          )}

          {groupedBenes && groupedBenes.contingent.length > 0 && (
            <ClickableCardContainer
              listItems={[...beneListItems(groupedBenes.contingent)]}
            >
              <div className={styles.allocationContainer}>
                <div className={styles.allocationHeader}>
                  <Icon type={IconType.USER_GROUP} />
                  <h2 className="typography-labels-label-md">
                    Contingent allocation
                  </h2>
                  <Popover
                    trigger={
                      <Icon
                        type={IconType.CIRCLE_INFO}
                        width={16}
                        height={16}
                        color="var(--color-base-icon-icon-tooltip, #ff7500)"
                      />
                    }
                    title="Contingent allocation"
                  >
                    <p>
                      Your contingent allocation tells us how to split up the
                      money between contingent beneficiaries, if needed.
                      Contingent beneficiaries will receive payment from your
                      coverage only if your primary beneficiaries have died.
                    </p>
                  </Popover>
                </div>
                <AllocationColorBar
                  type="contingent"
                  allocations={groupedBenes.contingent.map(
                    contingents => contingents.beneficiaryPercentage
                  )}
                />
              </div>
            </ClickableCardContainer>
          )}
        </div>
        <Footer showAction />
      </Suspense>
    </div>
  );
}
