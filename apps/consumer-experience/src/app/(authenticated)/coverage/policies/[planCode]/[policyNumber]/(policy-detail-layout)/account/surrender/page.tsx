import { Button, Label } from '@zinnia/bloom/components';
import { Metadata } from 'next';

import styles from '@/app/(authenticated)/coverage/shared-styles/ActionBar.module.css';
import { AccountValue } from '@/components/account-value/AccountValue';
import { FieldData } from '@/components/field-data/FieldData';
import { LabelPopover } from '@/components/label-popover/LabelPopover';
import { Link } from '@/components/link/Link';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { RouteKey, getPageTitle } from '@/route-map';
import { getPolicySurrenderDetails } from '@/services';
import { getPolicySurrenderEligibility } from '@/services/bpm/fullsurrender';
import { getCarrierConfig } from '@/services/carrier-config';
import { getFeatureFlags } from '@/services/feature-flags';
import { PolicyRequestInputs } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';
import { buildCommonLogContext } from '@/utils/logging/server-logging';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';
import { DEFAULT_UNAVAILABLE_STRING } from '@/utils/strings';
const NET_SURRENDER_VALUE = 'Net surrender value';

const pageTitle = getPageTitle(RouteKey.SURRENDER);
// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

export default async function SurrenderPolicy({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const flags = await getFeatureFlags();
  const { planCode, policyNumber } = params;
  const loggingContext = await buildCommonLogContext();
  const carrierConfig = await getCarrierConfig();

  const { data, error } = await getPolicySurrenderDetails(
    {
      planCode,
      policyNumber,
    },
    loggingContext
  );

  const showSurrenderCta =
    !!flags?.[FEATURE_FLAGS.TRANSACTION_FULL_SURRENDER] &&
    carrierConfig?.account?.surrender?.enabled;

  let isEligibleForSurrender = false;

  if (showSurrenderCta) {
    const { data: surrenderEligibility } = await getPolicySurrenderEligibility(
      planCode,
      policyNumber,
      loggingContext
    );

    isEligibleForSurrender = !!surrenderEligibility?.isEligible;
  }

  const surrenderData = () => {
    if (error || !data) {
      return <NoDataAvailable message={DEFAULT_UNAVAILABLE_STRING} />;
    }

    return (
      <>
        <p className="typography-content-body-sm">
          <span className="typography-content-body-sm-bold">
            Are you sure? Surrendering a policy means ending your coverage for a
            lump sum payment of the account surrender value.{' '}
          </span>
          That could mean losing important financial protection for your
          beneficiaries. Surrendering your policy may also have tax
          consequences.
        </p>
        <div className="card">
          <div className="column-card">
            <AccountValue
              planCode={planCode}
              policyNumber={policyNumber}
              hideTicker={true}
            />
            <FieldData
              Label={
                <Label
                  interactiveElements={[
                    <LabelPopover
                      key={NET_SURRENDER_VALUE}
                      title={NET_SURRENDER_VALUE}
                    >
                      <p>
                        Your net surrender value is the current account value
                        minus surrender charges, outstanding loans, and other
                        fees. This number tells you how much you can expect to
                        receive if you decide to surrender your policy and
                        cancel your coverage.
                      </p>
                    </LabelPopover>,
                  ]}
                >
                  {NET_SURRENDER_VALUE}
                </Label>
              }
            >
              <p className="typography-content-value">
                {formatUSDollars(data?.surrenderValue)}
              </p>
            </FieldData>
          </div>
          {showSurrenderCta && (
            <div className={styles.actionBarContainer}>
              {isEligibleForSurrender ? (
                <Link
                  // @TODO: CUI-919 replace with correct route when implementing surrender flow with stepped workflow
                  href={`/coverage/policies/${planCode}/${policyNumber}/surrender/information`}
                  role="link"
                  text="Surrender policy"
                />
              ) : (
                <Button
                  mode="link"
                  size="small"
                  disabled={!isEligibleForSurrender}
                >
                  Surrender policy
                </Button>
              )}
            </div>
          )}
        </div>
      </>
    );
  };

  return <div className="container">{surrenderData()}</div>;
}
