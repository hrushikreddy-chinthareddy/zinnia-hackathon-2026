import { LineOfBusiness, PolicyStatus } from '@zinnia/api-types/types/sor';
import { IconType } from '@zinnia/bloom/components';
import { Metadata } from 'next';

import { AccountValue } from '@/components/account-value/AccountValue';
import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import AdditionalOverviewLinks from '@/components/policy-overview/AdditionalOverviewLinks';
import { Coverage } from '@/components/policy-overview/Coverage';
import { CanceledFreelook } from '@/components/policy-overview/non-active-statuses/CanceledFreelook';
import { LapsedPolicy } from '@/components/policy-overview/non-active-statuses/LapsedPolicy';
import { SurrenderedPolicy } from '@/components/policy-overview/non-active-statuses/SurrenderedPolicy';
import { UpcomingPremium } from '@/components/policy-overview/UpcomingPremium';
import { getPolicyForHeaderDetails } from '@/services';
import { getComponentVisibility } from '@/services/display-rules';
import { ComponentName } from '@/services/display-rules/types';
import { LineOfBusinessPath } from '@/types';
import { buildCommonLogContext } from '@/utils/logging/server-logging';

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  // Include the carrier name here because the template only works for the children
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
  const loggingContext = await buildCommonLogContext();
  const { data, error } = await getPolicyForHeaderDetails(
    {
      planCode,
      policyNumber,
    },
    loggingContext
  );

  const visibility = await getComponentVisibility(policyNumber, planCode);

  if (error) {
    return (
      <>
        <div className="space-mb-gap-md">
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
          {visibility?.[ComponentName.OVERVIEW_COVERAGE]() && (
            <Coverage planCode={planCode} policyNumber={policyNumber} />
          )}
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

    if (data?.policyStatus === PolicyStatus.CANCELEDFREELOOK) {
      return (
        <>
          <CanceledFreelook />
          <CallForAssistance customInstruction="with policy questions." />
        </>
      );
    }

    return (
      <div className="card-container">
        {visibility?.[ComponentName.OVERVIEW_PREMIUM_LINK]() && (
          <UpcomingPremium
            planCode={planCode}
            policyNumber={policyNumber}
            extended={visibility?.[
              ComponentName.OVERVIEW_PREMIUM_DETAILED_VIEW
            ]()}
          />
        )}

        {visibility?.[ComponentName.OVERVIEW_ACCOUNT_VALUE]() && (
          <ClickableCardContainer>
            <ClickableCardContainer.LinkContent
              linkTo={{
                url: `/coverage/${LineOfBusinessPath.POLICIES}/${planCode}/${policyNumber}/account`,
                label: 'go to account value page',
              }}
            >
              <AccountValue
                planCode={planCode}
                policyNumber={policyNumber}
                isLink
                showIcon
              />
            </ClickableCardContainer.LinkContent>
          </ClickableCardContainer>
        )}

        {visibility?.[ComponentName.OVERVIEW_COVERAGE]() && (
          <Coverage
            planCode={planCode}
            policyNumber={policyNumber}
            lineOfBusiness={LineOfBusiness.LIFE}
          />
        )}

        <AdditionalOverviewLinks
          planCode={planCode}
          policyNumber={policyNumber}
          lineOfBusiness={LineOfBusiness.LIFE}
        />
      </div>
    );
  };

  return <div className="container">{overviewBody()}</div>;
}
