import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { IconType, Label } from '@zinnia/bloom/components';
import { Metadata } from 'next';

import { AccountValuePopover } from '@/components/account-value/AccountValuePopover';
import { CarrierPicker } from '@/components/carrier-picker/CarrierPicker';
import { CarrierPickerCookieOnly } from '@/components/carrier-picker/CarrierPickerCookieOnly';
import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { LabelPopover } from '@/components/label-popover/LabelPopover';
import MockMessage from '@/components/MockMessage';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { PolicyDetailsSummary } from '@/components/policy-details-summary/PolicyDetailsSummary';
import { CoveragePopover } from '@/components/policy-overview/CoveragePopover';
import { RouteKey, getPageTitle } from '@/route-map';
import { getMyPoliciesByCarrier } from '@/services';
import { getFeatureFlags } from '@/services/feature-flags';
import { SearchParams } from '@/types/url';
import { getCarrierIdsByThemeCookie } from '@/utils/carriers';
import { formatUSDollars } from '@/utils/currency';
import { lineOfBusinessUrlPath } from '@/utils/data';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';
import { getThemeCookies } from '@/utils/theme';
import { isVercelEnvironment } from '@/utils/url';

import styles from './policies.module.css';

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
        {policyReferenceData?.map(p => (
          <ClickableCardContainer key={p.policyNumber}>
            <ClickableCardContainer.LinkContent
              linkTo={{
                label: `Get details for Policy ${p.marketingName}`,
                url: `/coverage/${lineOfBusinessUrlPath(p?.lineOfBusiness)}/${p.planCode}/${p.policyNumber}`,
                isInternal: true,
              }}
            >
              <div className={`${styles.policyCard} mr-lg`}>
                <PolicyDetailsSummary
                  className="pl-none"
                  planCode={p.planCode || ''}
                  policyNumber={p.policyNumber}
                  summary={{ ...p }}
                />
                <div className={styles.policyCardPolicyValues}>
                  <FieldData
                    className="mr-3xl typography-content-body-sm-bold"
                    Label={
                      <Label
                        interactiveElements={[
                          <AccountValuePopover
                            key="account-value-popover"
                            dataTimestamp={p.effectiveDate}
                            lineOfBusiness={p.lineOfBusiness}
                          />,
                        ]}
                      >
                        Account value
                      </Label>
                    }
                  >
                    {formatUSDollars(p.totalFundValue)}
                  </FieldData>
                  {p.lineOfBusiness === LineOfBusiness.LIFE && (
                    <FieldData
                      className="typography-content-body-sm-bold"
                      Label={
                        <Label
                          interactiveElements={[
                            <CoveragePopover key="coverage-popover" />,
                          ]}
                        >
                          Coverage
                        </Label>
                      }
                    >
                      {formatUSDollars(p.totalCoverageAmount)}
                    </FieldData>
                  )}
                  {p.lineOfBusiness === LineOfBusiness.ANNUITY && (
                    <FieldData
                      className="typography-content-body-sm-bold"
                      Label={
                        <Label
                          interactiveElements={[
                            <LabelPopover title="Death Benefit">
                              <div className={styles.popoverContent}>
                                <p>
                                  This is how much money your beneficiaries may
                                  receive when you die.
                                </p>
                              </div>
                            </LabelPopover>,
                          ]}
                        >
                          Death Benefit
                        </Label>
                      }
                    >
                      {formatUSDollars(p.cumulativeGrossDeathBenefitAmount)}
                    </FieldData>
                  )}
                </div>
              </div>
            </ClickableCardContainer.LinkContent>
          </ClickableCardContainer>
        ))}
      </div>
    </div>
  );
}
