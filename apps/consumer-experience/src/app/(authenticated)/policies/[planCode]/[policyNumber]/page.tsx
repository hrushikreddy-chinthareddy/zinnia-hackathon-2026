import { PolicyStatus } from '@zinnia/api-types/types/sor';
import { IconType } from '@zinnia/bloom/internal/components';
import { Metadata } from 'next';

import { AccountValue } from '@/components/account-value/AccountValue';
import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';
import MockMessage from '@/components/MockMessage';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { Coverage } from '@/components/policy-overview/Coverage';
import { LapsedPolicy } from '@/components/policy-overview/non-active-statuses/LapsedPolicy';
import { SurrenderedPolicy } from '@/components/policy-overview/non-active-statuses/SurrenderedPolicy';
import { UpcomingPremium } from '@/components/policy-overview/UpcomingPremium';
import { getPolicyForHeaderDetails } from '@/services';

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
  const { data, error } = await getPolicyForHeaderDetails({
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

  const overviewBody = () => {
    if (data?.policyStatus === PolicyStatus.LAPSE) {
      return (
        <>
          <LapsedPolicy planCode={planCode} policyNumber={policyNumber} />
          <CallForAssistance customInstruction="for help with reinstatement." />
        </>
      );
    }

    if (data?.policyStatus === PolicyStatus.SURRENDERED) {
      return (
        <>
          <SurrenderedPolicy />
          <CallForAssistance customInstruction="with surrender questions." />
        </>
      );
    }

    return (
      <div className="card-container">
        <UpcomingPremium planCode={planCode} policyNumber={policyNumber} />
        <ClickableCardContainer
          linkTo={{
            url: `/policies/${planCode}/${policyNumber}/account`,
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
        <Coverage planCode={planCode} policyNumber={policyNumber} />
      </div>
    );
  };

  return (
    <div className="container">
      <HeaderBreadcrumb title="Policy Overview" />
      <HeaderPolicyDetails
        planCode={planCode}
        policyNumber={policyNumber}
        expanded
      />
      {overviewBody()}
    </div>
  );
}
