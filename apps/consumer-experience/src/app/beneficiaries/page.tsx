import {
  AllocationColorBar,
  Icon,
  IconType,
  Popover,
  contingentColorOrder,
  primaryColorOrder,
} from '@zinnia/bloom/internal/components';

import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';
import { baseAppUrl } from '@/services/api-config';
import { serverApi } from '@/services/server';
import { formatUSDollars } from '@/utils/currency';

import styles from './Beneficiaries.module.css';

// TODO: this should be a prop
const policyValue = 1000000;

interface Beneficiary {
  firstName: string;
  lastName: string;
  allocation: number;
}

const primary = [
  {
    allocation: 20,
    firstName: 'John',
    lastName: 'Williams',
  },
  {
    allocation: 30,
    firstName: 'Becky',
    lastName: 'Williams',
  },
  {
    allocation: 50,
    firstName: 'Ted',
    lastName: 'Williams',
  },
];

const contingents = [
  {
    allocation: 50,
    firstName: 'John',
    lastName: 'Todd',
  },
  {
    allocation: 50,
    firstName: 'Todd',
    lastName: 'John',
  },
];

const BeneficiaryListItem = ({
  beneficiary,
  index,
  type,
}: {
  beneficiary: Beneficiary;
  index: number;
  type: 'primary' | 'contingent';
}) => {
  const colorArray =
    type === 'contingent' ? contingentColorOrder : primaryColorOrder;

  return (
    <div className={styles.allocationItem}>
      <p className="typography-labels-label-sm">{`${beneficiary.firstName} ${beneficiary.lastName}`}</p>
      <div className={styles.allocationDetails}>
        <span
          aria-hidden
          className={styles.colorBlock}
          style={{ backgroundColor: colorArray[index] }}
        ></span>
        <p className="typography-content-value">{`${beneficiary.allocation}%`}</p>
      </div>
    </div>
  );
};

export default async function Beneficiaries() {
  const policyOverviewData = await Promise.allSettled([
    serverApi.get(`${baseAppUrl}/api/policies/2345`),
  ]);

  const policyResult = policyOverviewData?.[0];

  const policyData = policyResult.status !== 'rejected' ? policyResult?.value?.data : {};

  const primaryListItems = primary.map((bene, index) => {
    return {
      linkTo: {
        // TODO: how will this url be structured?
        url: '#',
        label: `go to primary beneficiary ${bene.firstName} ${bene.lastName} profile page`,
      },
      content: (
        <BeneficiaryListItem beneficiary={bene} index={index} type="primary" />
      ),
    };
  });

  const contingentListItems = contingents.map((bene, index) => {
    return {
      linkTo: {
        // TODO: how will this url be structured?
        url: '#',
        label: `go to contingent beneficiary ${bene.firstName} ${bene.lastName} profile page`,
      },
      content: (
        <BeneficiaryListItem
          beneficiary={bene}
          index={index}
          type="contingent"
        />
      ),
    };
  });

  return (
    <div>
      <HeaderBreadcrumb title="Beneficiaries" />
      <HeaderPolicyDetails className={styles.policyDetails} {...policyData.policyDetails}/>
      <div className={styles.itemsContainer}>
        <ClickableCardContainer>
          <div className={styles.infoCard}>
            <div>
              <Icon type={IconType.LIGHTBULB} />
            </div>
            <p className="typography-content-body-sm">
              You’re covered for{' '}
              <span style={{ fontWeight: 600 }}>
                {formatUSDollars(policyValue)}
              </span>
              . That means if you die while your policy is active your
              beneficiaries will receive this amount (minus outstanding loans
              and applicable interest calculations), according to your
              allocations.
            </p>
          </div>
        </ClickableCardContainer>
        <ClickableCardContainer listItems={[...primaryListItems]}>
          <div className={styles.allocationContainer}>
            <div className={styles.allocationHeader}>
              <Icon type={IconType.USER_GROUP} />
              <h2 className="typography-labels-label-md">Primary allocation</h2>
              <Popover
                trigger={
                  <Icon
                    type={IconType.CIRCLE_INFO}
                    width={16}
                    height={16}
                    color="var(--color-primary-color-primary, #ff7500)"
                  />
                }
                title="Primary allocation"
              >
                <p>
                  Your primary allocation tells us how to split up the money
                  between primary beneficiaries after you die. Your primary
                  beneficiaries are first in line to receive payment from your
                  coverage.
                </p>
              </Popover>
            </div>
            <AllocationColorBar
              type="primary"
              allocations={primary.map(primary => primary.allocation)}
            />
          </div>
        </ClickableCardContainer>

        <ClickableCardContainer listItems={[...contingentListItems]}>
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
                    color="var(--color-primary-color-primary, #ff7500)"
                  />
                }
                title="Contingent allocation"
              >
                <p>
                  Your contingent allocation tells us how to split up the money
                  between contingent beneficiaries, if needed. Contingent
                  beneficiaries will receive payment from your coverage only if
                  your primary beneficiaries have died.
                </p>
              </Popover>
            </div>
            <AllocationColorBar
              type="contingent"
              allocations={contingents.map(
                contingents => contingents.allocation
              )}
            />
          </div>
        </ClickableCardContainer>
      </div>
    </div>
  );
}
