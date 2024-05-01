import { IconType, Label } from '@zinnia/bloom/internal/components';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { AccountValuePopover } from '@/components/account-value/AccountValuePopover';
import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { PolicyDetailsSummary } from '@/components/header-policy-details/HeaderPolicyDetails';
import MockMessage from '@/components/MockMessage';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { CoveragePopover } from '@/components/policy-overview/CoveragePopover';
import { getMyPoliciesByCarrier } from '@/services';
import { formatUSDollars } from '@/utils/currency';

import styles from './policies.module.css';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'My Policies',
};

export default async function Page() {
  const { data: policyReferenceData, error } =
    await getMyPoliciesByCarrier('SBUL');

  if (error || policyReferenceData?.length === 0) {
    return (
      <>
        <HeaderBreadcrumb title="My Policies" />
        <div className="card-container">
          <MockMessage />
          <NoDataAvailable
            iconType={IconType.SHIELD_EXCLAMATION}
            message="There are currently no policies associated with your account."
          />
        </div>
      </>
    );
  }

  if (policyReferenceData?.length === 1) {
    const [policyReference] = policyReferenceData;
    return redirect(
      `/policies/${policyReference?.planCode}/${policyReference?.policyNumber}`
    );
  }

  return (
    <div className="container">
      <HeaderBreadcrumb title="My Policies" />
      <div className="card-container" style={{ paddingLeft: 0 }}>
        {policyReferenceData?.map(p => (
          <ClickableCardContainer
            key={p.policyNumber}
            linkTo={{
              label: `Get details for Policy ${p.planName}`,
              url: `/policies/${p.planCode}/${p.policyNumber}`,
              isInternal: true,
            }}
          >
            <div className={`${styles.policyCard} mr-lg`}>
              <PolicyDetailsSummary
                className="pl-none"
                planCode={p.planCode || ''}
                policyNumber={p.policyNumber}
                summary={{ ...p }}
                expanded
              />
              <div className={styles.policyCardPolicyValues}>
                <FieldData
                  className="mr-3xl"
                  Label={
                    <Label
                      interactiveElements={[
                        <AccountValuePopover key="account-value-popover" />,
                      ]}
                    >
                      Account value
                    </Label>
                  }
                >
                  {formatUSDollars(p.totalFundValue)}
                </FieldData>
                <FieldData
                  Label={
                    <Label
                      interactiveElements={[
                        <CoveragePopover key="coverage-popover" />,
                      ]}
                    >
                      Coverage
                    </Label>
                  }
                >
                  {formatUSDollars(p.totalCoverageAmount)}
                </FieldData>
              </div>
            </div>
          </ClickableCardContainer>
        ))}
      </div>
    </div>
  );
}
