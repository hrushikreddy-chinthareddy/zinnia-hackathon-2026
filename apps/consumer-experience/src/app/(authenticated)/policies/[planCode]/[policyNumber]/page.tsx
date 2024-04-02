import { IconType } from '@zinnia/bloom/internal/components';
import { Metadata } from 'next';

import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';
import MockMessage from '@/components/MockMessage';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { AccountValue } from '@/components/policy-overview/AccountValue';
import { Coverage } from '@/components/policy-overview/Coverage';
import styles from '@/components/policy-overview/PolicyOverview.module.css';
import { UpcomingPremium } from '@/components/policy-overview/UpcomingPremium';
import { getPolicyForHeaderDetails } from '@/services';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Policy Overview',
};

export default async function Page({
  params,
}: {
  params: {
    planCode: string;
    policyNumber: string;
  };
}) {
  const { planCode, policyNumber } = params;
  const { error } = await getPolicyForHeaderDetails({
    planCode,
    policyNumber,
  });

  if (error) {
    return (
      <>
        <HeaderBreadcrumb title="Policy Overview" />
        <div className="space-mb-gap-md">
          <MockMessage />
          <NoDataAvailable
            iconType={IconType.SHIELD_EXCLAMATION}
            message="There is currently no policy data available."
          />
        </div>
      </>
    );
  }

  return (
    <>
      <HeaderBreadcrumb title="Policy Overview" />
      <HeaderPolicyDetails planCode={planCode} policyNumber={policyNumber} />
      <div className="space-mb-gap-md">
        <UpcomingPremium planCode={planCode} policyNumber={policyNumber} />
        <ClickableCardContainer
          linkTo={{
            url: `/policies/${planCode}/${policyNumber}/account-value`,
            label: 'go to account value page',
          }}
        >
          <AccountValue
            planCode={planCode}
            policyNumber={policyNumber}
            isLink
            showIcon
          />
        </ClickableCardContainer>
        {/* <AccountValue planCode={planCode} policyNumber={policyNumber} isLink /> */}
        <Coverage planCode={planCode} policyNumber={policyNumber} />
      </div>
      <Footer />
    </>
  );
}
