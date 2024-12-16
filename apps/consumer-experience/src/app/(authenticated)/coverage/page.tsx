import { IconType } from '@zinnia/bloom/components';
import { Metadata } from 'next';

import { AcknowledgePolicyCard } from '@/components/acknowledge-policy-card/AcknowledgePolicyCard';
import { CarrierPicker } from '@/components/carrier-picker/CarrierPicker';
import { CarrierPickerCookieOnly } from '@/components/carrier-picker/CarrierPickerCookieOnly';
import { CoverageOverviewCard } from '@/components/coverage-overview-card/CoverageOverviewCard';
import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import MockMessage from '@/components/MockMessage';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { RouteKey, getPageTitle } from '@/route-map';
import { checkResetDeliveryDateEligibility } from '@/services/bpm';
import { getFeatureFlags } from '@/services/feature-flags';
import { getMyPoliciesByCarrier } from '@/services/policy';
import { SearchParams } from '@/types/url';
import { getCookie } from '@/utils/auth';
import { getCarrierIdsByThemeCookie } from '@/utils/carriers';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';
import { ACKNOWLEDGEMENT_COOKIE_KEY } from '@/utils/serverClientUtils';
import { getThemeCookies } from '@/utils/theme';
import { isVercelEnvironment } from '@/utils/url';

const pageTitle = getPageTitle(RouteKey.COVERAGE);
// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const featureFlagDecisions = await getFeatureFlags();
  const themeCookie = await getThemeCookies();
  const showPicker =
    featureFlagDecisions?.[FEATURE_FLAGS.ANNUITY_MODE] && !themeCookie;

  const carrierIds = getCarrierIdsByThemeCookie(themeCookie);

  const { data: policyReferenceData, error } =
    await getMyPoliciesByCarrier(carrierIds);

  const ackowledgedCookie = await getCookie(ACKNOWLEDGEMENT_COOKIE_KEY);
  const parsedCookie = JSON.parse(ackowledgedCookie || '[]');

  const checkRequiresAckowledgement = [];
  for (const policy of policyReferenceData || []) {
    const policyIsInAcknowledgedCookie = parsedCookie?.includes(
      policy.policyNumber
    );

    // Only want to check if the policy needs to be acknowledged if it isn't in the cookie
    if (!policyIsInAcknowledgedCookie) {
      checkRequiresAckowledgement.push(
        checkResetDeliveryDateEligibility({
          planCode: policy.planCode || '',
          policyNumber: policy.policyNumber,
        })
      );
    }
  }

  // const checkEligibilityResults = (
  //   await Promise.allSettled(checkRequiresAckowledgement)
  // )
  //   .filter(result => result.status === 'fulfilled')
  //   .map(result => result.value.data);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const checkEligibilityResults = [] as any;

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

  if (showPicker && policyReferenceData) {
    return (
      <div className="container">
        <HeaderBreadcrumb title={pageTitle} preventReturnToPrevious />
        <div className="card-container">
          <p className="typography-content-body-sm">
            Select a policy below to get started.
          </p>
          {isVercelEnvironment() ? (
            <CarrierPickerCookieOnly policies={policyReferenceData} />
          ) : (
            <CarrierPicker
              policies={policyReferenceData}
              searchParams={searchParams}
            />
          )}
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="container">
      <HeaderBreadcrumb title={pageTitle} preventReturnToPrevious />
      <div className="card-container" style={{ paddingLeft: 0 }}>
        {policyReferenceData?.map(p => {
          // We don't set the cookie here because we rely on that to happen
          // either in middleware or once the user has actively acknowledged the
          // policy
          const requiresAcknowledgement = checkEligibilityResults.find(
            (result: { policyNumber: string; isEligible: unknown }) =>
              result.policyNumber === p.policyNumber && result.isEligible
          );

          if (requiresAcknowledgement) {
            return <AcknowledgePolicyCard key={p.policyNumber} policy={p} />;
          }
          return <CoverageOverviewCard key={p.policyNumber} policy={p} />;
        })}
      </div>
    </div>
  );
}
