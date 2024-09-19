import { IconType, Label } from '@zinnia/bloom/components';
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
import { CarrierId } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';

import styles from './policies.module.css';
import { lineOfBusinessUrlPath } from '@/utils/data';

const pageTitle = getPageTitle(RouteKey.COVERAGE);
// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

//TODO: Feature flag returning the ELIC stuff?
export default async function Page() {
  const { data: policyReferenceData, error } = await getMyPoliciesByCarrier([
    CarrierId.SBUL,
    CarrierId.ELIC,
  ]);

  if (error || policyReferenceData?.length === 0) {
    return (
      <>
        <HeaderBreadcrumb title={pageTitle} preventReturnToPrevious />
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
      <HeaderBreadcrumb title={pageTitle} preventReturnToPrevious />
      <div className="card-container" style={{ paddingLeft: 0 }}>
        {policyReferenceData?.map(p => (
          <ClickableCardContainer key={p.policyNumber}>
            <ClickableCardContainer.LinkContent
              linkTo={{
                label: `Get details for Policy ${p.marketingName}`,
                // TODO: need to add policy vs annuity here
                url: `/coverage/${lineOfBusinessUrlPath(p)}/${p.planCode}/${p.policyNumber}`,
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
            </ClickableCardContainer.LinkContent>
          </ClickableCardContainer>
        ))}
      </div>
    </div>
  );
}
