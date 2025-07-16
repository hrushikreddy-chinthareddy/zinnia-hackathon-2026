import { IconType } from '@zinnia/bloom/components';
import { Metadata } from 'next';

import { AnalyticsPageHeader } from '@/components/analytics/AnalyticsPageHeader';
import { CarrierPicker } from '@/components/carrier-picker/CarrierPicker';
import { CarrierPickerCookieOnly } from '@/components/carrier-picker/CarrierPickerCookieOnly';
import { CoverageCard } from '@/components/coverage-card/CoverageCard';
import { Footer } from '@/components/footer/Footer';
import MockMessage from '@/components/MockMessage';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { RouteKey, getPageTitle } from '@/route-map';
import { getFeatureFlags } from '@/services/feature-flags';
import { getMyPoliciesByCarrier } from '@/services/policy';
import { SearchParams } from '@/types/url';
import { getCarrierIdsByThemeCookie } from '@/utils/carriers';
import { isVercelEnvironment } from '@/utils/environment';
import { buildCommonLogContext } from '@/utils/logging/server-logging';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';
import { getThemeCookies } from '@/utils/theme';

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

  const loggingContext = await buildCommonLogContext();
  const { data: policyReferenceData, error } = await getMyPoliciesByCarrier(
    carrierIds,
    loggingContext
  );

  const CoveragePageHeader = (
    <AnalyticsPageHeader analyticsProps={{}} pageTitle={pageTitle} />
  );

  if (error || policyReferenceData?.length === 0) {
    return (
      <>
        {CoveragePageHeader}
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

  let Body = <></>;

  if (showPicker && !!policyReferenceData) {
    Body = (
      <>
        <div className="card-container">
          <p className="typography-content-body-sm">
            Select a carrier below to get started.
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
      </>
    );
  } else {
    Body = (
      <div className="card-container" style={{ paddingLeft: 0 }}>
        {policyReferenceData?.map(p => {
          return (
            <CoverageCard
              key={p.policyNumber}
              policy={p}
              redirectTo={searchParams?.redirectTo}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="container">
      {CoveragePageHeader}
      {Body}
    </div>
  );
}
