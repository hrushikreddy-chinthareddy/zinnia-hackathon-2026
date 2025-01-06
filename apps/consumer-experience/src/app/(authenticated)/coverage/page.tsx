import { IconType } from '@zinnia/bloom/components';
import { Metadata } from 'next';

import { CarrierPicker } from '@/components/carrier-picker/CarrierPicker';
import { CarrierPickerCookieOnly } from '@/components/carrier-picker/CarrierPickerCookieOnly';
import { CoverageCard } from '@/components/coverage-card/CoverageCard';
import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import MockMessage from '@/components/MockMessage';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { RouteKey, getPageTitle } from '@/route-map';
import { getFeatureFlags } from '@/services/feature-flags';
import { getMyPoliciesByCarrier } from '@/services/policy';
import { SearchParams } from '@/types/url';
import { getCarrierIdsByThemeCookie } from '@/utils/carriers';
import { isVercelEnvironment } from '@/utils/environment';
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

  const { data: policyReferenceData, error } =
    await getMyPoliciesByCarrier(carrierIds);

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
          return <CoverageCard key={p.policyNumber} policy={p} />;
        })}
        {/* <CoverageCard policy={policyReferenceData[0]} /> */}
      </div>
    </div>
  );
}
