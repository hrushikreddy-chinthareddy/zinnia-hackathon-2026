import { LineOfBusiness, PolicyStatus } from '@zinnia/api-types/types/sor';
import { IconType } from '@zinnia/bloom/components';
import { Metadata } from 'next';
import { Suspense } from 'react';

import { AccountValue } from '@/components/account-value/AccountValue';
import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import AdditionalOverviewLinks from '@/components/policy-overview/AdditionalOverviewLinks';
import { CancelledFreelook } from '@/components/policy-overview/non-active-statuses/cancelled-freelook/CancelledFreelook';
import { LapsedPolicy } from '@/components/policy-overview/non-active-statuses/LapsedPolicy';
import { SurrenderedPolicy } from '@/components/policy-overview/non-active-statuses/SurrenderedPolicy';
import { LargeSkeleCard } from '@/components/skeleton-loader/policy-page/policy-page-skeletons';
import { getPolicyForHeaderDetails } from '@/services';
import { getComponentVisibility } from '@/services/display-rules';
import { ComponentName } from '@/services/display-rules/types';
import { LineOfBusinessPath } from '@/types';
import { DocumentCategory } from '@/types/document';
import { buildCommonLogContext } from '@/utils/logging/server-logging';

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  // Include the carrier name here because the template only works for the children
  // TODO: update carrier name when we solve dynamic carrier setting
  title: 'Contract Overview',
};

export default async function Page({
  params,
  searchParams,
}: {
  params: {
    planCode: string;
    policyNumber: string;
  };
  searchParams: { type: DocumentCategory };
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
            message="There is currently no contract data available."
          />
        </div>
      </>
    );
  }

  const overviewBody = () => {
    if (data?.policyStatus === PolicyStatus.LAPSE) {
      return (
        <Suspense fallback={<LargeSkeleCard />}>
          <LapsedPolicy planCode={planCode} policyNumber={policyNumber} />
          <CallForAssistance customInstruction="for help with reinstatement." />
        </Suspense>
      );
    }

    if (data?.policyStatus === PolicyStatus.SURRENDERED) {
      return (
        <Suspense fallback={<LargeSkeleCard />}>
          <SurrenderedPolicy
            planCode={planCode}
            policyNumber={policyNumber}
            activeDocumentsTab={searchParams.type || DocumentCategory.DOCUMENTS}
          />
          <CallForAssistance customInstruction="with surrender questions." />
        </Suspense>
      );
    }

    if (data?.policyStatus === PolicyStatus.CANCELEDFREELOOK) {
      return (
        <Suspense fallback={<LargeSkeleCard />}>
          <CancelledFreelook
            lineOfBusiness={LineOfBusiness.ANNUITY}
            planCode={planCode}
            policyNumber={policyNumber}
            activeDocumentsTab={searchParams.type || DocumentCategory.DOCUMENTS}
          />
        </Suspense>
      );
    }

    return (
      <div className="card-container">
        {visibility?.[ComponentName.OVERVIEW_ACCOUNT_VALUE]() && (
          <Suspense fallback={<LargeSkeleCard />}>
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
          </Suspense>
        )}
        <Suspense fallback={<LargeSkeleCard />}>
          <AdditionalOverviewLinks
            planCode={planCode}
            policyNumber={policyNumber}
            lineOfBusiness={LineOfBusiness.ANNUITY}
          />
        </Suspense>
      </div>
    );
  };

  return <div className="container">{overviewBody()}</div>;
}
