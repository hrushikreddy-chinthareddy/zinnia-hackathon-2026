import { IconType, Label } from '@zinnia/bloom/internal/components';
import { Metadata } from 'next';

import { AccountValuePopover } from '@/components/account-value/AccountValuePopover';
import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import MockMessage from '@/components/MockMessage';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { PolicyDetailsSummary } from '@/components/policy-details-summary/PolicyDetailsSummary';
import { CoveragePopover } from '@/components/policy-overview/CoveragePopover';
import { RouteKey, getPageTitle } from '@/route-map';
import { getMyPoliciesByCarrier } from '@/services';
import { formatUSDollars } from '@/utils/currency';

import styles from './policies.module.css';

const pageTitle = getPageTitle(RouteKey.POLICIES);
// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

export default async function Page() {
  const { data: policyReferenceData, error } =
    await getMyPoliciesByCarrier('SBUL');

  if (error || policyReferenceData?.length === 0) {
    return (
      <>
        <HeaderBreadcrumb title={pageTitle} preventGoBack />
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

  return (
    <div className="container">
      <HeaderBreadcrumb title={pageTitle} preventGoBack />
      <div className="card-container" style={{ paddingLeft: 0 }}>
        {policyReferenceData?.map(p => (
          <ClickableCardContainer
            key={p.policyNumber}
            linkTo={{
              label: `Get details for Policy ${p.marketingName}`,
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
              />
              <div className={styles.policyCardPolicyValues}>
                <FieldData
                  className="mr-3xl"
                  Label={
                    <Label
                      interactiveElements={[
                        <AccountValuePopover
                          key="account-value-popover"
                          dataTimestamp={p.effectiveDate}
                        />,
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
                        <CoveragePopover
                          key="coverage-popover"
                          dataTimestamp={p.effectiveDate}
                        />,
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
