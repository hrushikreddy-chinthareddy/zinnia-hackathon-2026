import { Metadata } from 'next';

import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { UpcomingPremium } from '@/components/policy-overview/UpcomingPremium';
import { RouteKey, getPageTitle } from '@/route-map';
import { PolicyRequestInputs } from '@/types/policy';
import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { Icon, IconType } from '@zinnia/bloom/components';
import { toSentenceCase } from '@zinnia/utils';

const pageTitle = getPageTitle(RouteKey.PREMIUM);
// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

export default async function PremiumPayments({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { planCode, policyNumber } = params;
  return (
    <>
      <div className="card-container">
        <UpcomingPremium
          planCode={params.planCode}
          policyNumber={params.policyNumber}
          title="Next upcoming premium"
          extended
        />
        <ClickableCardContainer>
          <ClickableCardContainer.LinkContent
            linkTo={{
              url: `/policies/${planCode}/${policyNumber}/premium/history`,
              label: 'go to payment history page',
            }}
          >
            <div className="flex-center">
              {/* TODO: update once new version of bloom is released */}
              <Icon
                type={IconType.CALENDAR}
                color="var(--color-base-icon-icon-dark)"
              />
              <span className="typography-labels-field-label ml-md">
                {toSentenceCase('Payment history')}
              </span>
            </div>
          </ClickableCardContainer.LinkContent>
        </ClickableCardContainer>
      </div>
      <CallForAssistance customInstruction="to make a payment." />
    </>
  );
}
