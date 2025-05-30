import { LineOfBusiness, PartyRole } from '@zinnia/api-types/types/sor';
import {
  AllocationColorBar,
  Icon,
  IconType,
  contingentColorOrder,
  primaryColorOrder,
} from '@zinnia/bloom/components';
import { Metadata } from 'next';

import styles from '@/app/(authenticated)/coverage/shared-styles/Beneficiaries.module.css';
import { BeneficiariesView } from '@/app/(authenticated)/coverage/shared-views/beneficiaries-view/BeneficiariesView';
import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { LabelPopover } from '@/components/label-popover/LabelPopover';
import MockMessage from '@/components/MockMessage';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { FullName } from '@/components/pii/FullName';
import { RouteKey, getPageTitle } from '@/route-map';
import { getFeatureFlags } from '@/services/feature-flags';
import { getBeneficiaries } from '@/services/policy';
import { Beneficiary } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';
import { buildCommonLogContext } from '@/utils/logging/server-logging';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

const pageTitle = getPageTitle(RouteKey.BENEFICIARIES);
// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

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
        <FullName
          firstName={beneficiary?.firstName}
          lastName={beneficiary?.lastName}
        />
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
  const flags = await getFeatureFlags();
  const showParties = flags?.[FEATURE_FLAGS.POLICY_OWNER_PROFILE_PARTIES];
  const loggingContext = await buildCommonLogContext();
  const { data, error } = await getBeneficiaries(
    {
      planCode,
      policyNumber,
    },
    loggingContext
  );

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

  if (showParties) {
    return (
      <BeneficiariesView
        data={{
          beneficiaries: groupedBenes,
          totalCoverageAmount: data?.totalCoverageAmount,
        }}
        lineOfBusiness={LineOfBusiness.LIFE}
      />
    );
  }

  const beneListItems = (beneGroup: Beneficiary[]) =>
    beneGroup?.map((bene: Beneficiary, index: number) => {
      return {
        linkTo: {
          // For now using partyId here to identify the beneficiary, but it's not the best look from a consumer standpoint
          url: `/coverage/policies/${planCode}/${policyNumber}/beneficiaries/${bene.partyId}`,
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
      <p className="typography-content-body-sm">
        You’re covered for{' '}
        <span style={{ fontWeight: 600 }}>
          {formatUSDollars(data?.totalCoverageAmount)}
        </span>
        . That means if you die while your policy is active (and you're in
        compliance with all policy requirements) your beneficiaries will receive
        this amount, plus any additional account value and minus outstanding
        loans, withdrawals or other interest calculations, if applicable.
      </p>

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
        </ClickableCardContainer>
      )}
      <CallForAssistance
        callToAction="Updating beneficiaries is coming soon. For now,"
        contactPrompt="call"
        customInstruction=" to make changes."
      />
    </div>
  );
}
