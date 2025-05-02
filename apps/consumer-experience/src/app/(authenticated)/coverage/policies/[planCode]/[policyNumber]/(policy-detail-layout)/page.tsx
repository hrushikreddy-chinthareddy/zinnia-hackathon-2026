import { LineOfBusiness, PolicyStatus } from '@zinnia/api-types/types/sor';
import { IconType } from '@zinnia/bloom/components';
import { Metadata } from 'next';

import { AccountValue } from '@/components/account-value/AccountValue';
import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import MockMessage from '@/components/MockMessage';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import AdditionalOverviewLinks from '@/components/policy-overview/AdditionalOverviewLinks';
import { Coverage } from '@/components/policy-overview/Coverage';
import { CanceledFreelook } from '@/components/policy-overview/non-active-statuses/CanceledFreelook';
import { LapsedPolicy } from '@/components/policy-overview/non-active-statuses/LapsedPolicy';
import { SurrenderedPolicy } from '@/components/policy-overview/non-active-statuses/SurrenderedPolicy';
import { UpcomingPremium } from '@/components/policy-overview/UpcomingPremium';
import { getPolicyForHeaderDetails } from '@/services';
import { LineOfBusinessPath } from '@/types';
import { ExtendedPolicyProductType } from '@/types/policy';

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
  const { data, error } = await getPolicyForHeaderDetails({
    planCode,
    policyNumber,
  });

  if (error) {
    return (
      <>
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
        <UpcomingPremium planCode={planCode} policyNumber={policyNumber} />
        {data?.product?.productType !== ExtendedPolicyProductType.TERM && (
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

        <Coverage
          planCode={planCode}
          policyNumber={policyNumber}
          lineOfBusiness={LineOfBusiness.LIFE}
        />
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
