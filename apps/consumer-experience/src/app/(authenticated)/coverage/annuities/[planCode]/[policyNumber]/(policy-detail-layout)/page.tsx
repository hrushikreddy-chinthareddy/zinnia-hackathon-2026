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
import { getPolicyForHeaderDetails } from '@/services';
import { LineOfBusinessPath } from '@/types';

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  // Include the carrier name here because the template only works for the children
  // TODO: update carrier name when we solve dynamic carrier setting
  title: 'Contract Overview - Everly',
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
          <CallForAssistance customInstruction="with questions." />
        </>
      );
    }

    return (
      <div className="card-container">
        <ClickableCardContainer>
          <ClickableCardContainer.LinkContent
            linkTo={{
              url: `/coverage/${LineOfBusinessPath.ANNUITIES}/${planCode}/${policyNumber}/account`,
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
        <Coverage
          planCode={planCode}
          policyNumber={policyNumber}
          lineOfBusiness={LineOfBusiness.ANNUITY}
        />
        <AdditionalOverviewLinks
          planCode={planCode}
          policyNumber={policyNumber}
          lineOfBusiness={LineOfBusiness.ANNUITY}
        />
      </div>
    );
  };

  return <div className="container">{overviewBody()}</div>;
}
