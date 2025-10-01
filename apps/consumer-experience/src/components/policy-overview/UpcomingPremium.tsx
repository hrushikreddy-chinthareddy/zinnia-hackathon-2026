import { DEFAULT_UNAVAILABLE_STRING } from '@xd/utils/dist';
import { isNullEmptyOrUndefined } from '@xd/xd-components/src/utils/Data';
import { Status } from '@zinnia/api-types/types/sor';
import { Label, Icon, IconType, Button } from '@zinnia/bloom/components';
import clsx from 'clsx';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { Link } from '@/components/link/Link';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { UpcomingPremiumPopover } from '@/components/policy-overview/UpcomingPremiumPopover';
import { getOneTimePremiumEligibility } from '@/services/bpm/one-time-premium-payment';
import { getFeatureFlagsWithCarrierConfig } from '@/services/feature-flags-carrier-config';
import { getUpcomingPremium } from '@/services/policy';
import { getPolicyFeatures } from '@/services/policy/features';
import { formatUSDollars } from '@/utils/currency';
import { buildCommonLogContext } from '@/utils/logging/server-logging';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import { CancelAutopaySidesheet } from './CancelAutopaySidesheet';
import styles from './PolicyOverview.module.css';
import {
  AutopayStatus,
  determineAutopayDisplayAndEligibility,
  upcomingPaymentDetails,
} from './utils';
import { defaultStep, getStepInfo } from '../one-time-premium-payment/steps';

dayjs.extend(isSameOrAfter);

export const UpcomingPremium = async ({
  planCode,
  policyNumber,
  extended,
}: {
  planCode: string;
  policyNumber: string;
  extended?: boolean;
}) => {
  const loggingContext = await buildCommonLogContext();
  const { featureFlags, carrierConfig } =
    await getFeatureFlagsWithCarrierConfig();
  const systematicPremiumFeatureFlag =
    featureFlags?.[FEATURE_FLAGS.TRANSACTION_SYSTEMATIC_PREMIUM] &&
    carrierConfig?.systematicPremium.enabled;

  const [
    systematicUpcomingResult,
    ottpEligibilityResult,
    policyFeaturesResult,
  ] = await Promise.allSettled([
    getUpcomingPremium(
      {
        planCode,
        policyNumber,
      },
      loggingContext
    ),
    getOneTimePremiumEligibility(
      {
        planCode,
        policyNumber,
      },
      loggingContext
    ),
    getPolicyFeatures(
      {
        planCode,
        policyNumber,
      },
      loggingContext
    ),
  ]);

  const policyFeatures =
    policyFeaturesResult?.status === 'fulfilled'
      ? policyFeaturesResult.value?.data?.data
      : [];

  const { data, error } =
    systematicUpcomingResult && systematicUpcomingResult.status === 'fulfilled'
      ? systematicUpcomingResult.value
      : {
          data: null,
          error: {
            message: 'Error fetching upcoming premium',
            ...loggingContext,
          },
        };

  const ottpPaymentDisabled =
    ottpEligibilityResult?.status !== 'fulfilled' ||
    !!ottpEligibilityResult?.value?.data?.reason ||
    !!ottpEligibilityResult?.value?.error;

  let cancelAutopayEnabled = false;
  let manageAutopayLinkDisplay = 'Set up autopay';
  let manageAutopayEnabled = false;
  // Determine Cancel Autopay enablement by checking eligibility for the specific arrangement
  if (systematicPremiumFeatureFlag) {
    const { cancelAutopayEligible, addManageEligible, autopayCurrentState } =
      await determineAutopayDisplayAndEligibility({
        arrangementId: data?.arrangementId,
        loggingContext,
        planCode,
        policyNumber,
      });

    cancelAutopayEnabled = cancelAutopayEligible;
    manageAutopayLinkDisplay =
      autopayCurrentState === AutopayStatus.MANAGE
        ? 'Manage autopay'
        : manageAutopayLinkDisplay;
    manageAutopayEnabled = addManageEligible;
  }

  // TODO: not sure if this is what should happen here if just the upcoming value fails
  if (error) {
    return (
      <div className="space-mb-gap-lg">
        <NoDataAvailable
          iconType={IconType.AUTOPAY}
          message="There is currently no premium payments data available."
        />
      </div>
    );
  }

  const {
    amount: upcomingPaymentAmount,
    arrangementId,
    nextActivityDate,
    nextActivityStatus,
    policyStatus,
    productType,
    frequency,
  } = data;

  const upcomingPaymentValid =
    (nextActivityDate &&
      nextActivityStatus === Status.ACTIVE &&
      // There was a bug in the back end code, where these programs couldn't be end dated at first, so they
      // were setting the end date to 2044 OR setting the date to  a way to indicate they were no longer active. That has since been
      // updated (10/2024) and we can rely on the status to indicate if the upcoming payment is active, HOWEVER,
      // there are still some in the system that are "inactive" based on their date. We are not accounting for any with
      // 2044 dates here, but are checking if date is in the past.
      dayjs(nextActivityDate).isSameOrAfter(dayjs(), 'day')) ||
    false;

  const {
    amount: paymentAmount,
    caption,
    label,
  } = upcomingPaymentDetails({
    policyStatus,
    policyFeatures,
    upcomingPaymentAmount,
    upcomingPaymentValid,
    nextActivityDate,
    productType,
  });

  return (
    <ClickableCardContainer>
      <ClickableCardContainer.LinkContent
        linkTo={{
          url: extended
            ? ''
            : `/coverage/policies/${planCode}/${policyNumber}/premium`, //annuities logic
          label: 'go to premium payments page',
        }}
      >
        <div className={styles.content}>
          <Icon type={IconType.AUTOPAY} className={styles.icon} />
          <FieldData
            Label={
              <Label
                interactiveElements={[
                  <UpcomingPremiumPopover key="upcoming-popover" />,
                ]}
              >
                {label}
              </Label>
            }
            caption={caption}
          >
            {isNullEmptyOrUndefined(paymentAmount) ? (
              <p className="typography-content-body-sm">
                {DEFAULT_UNAVAILABLE_STRING}
              </p>
            ) : (
              <p className="typography-content-value">
                {formatUSDollars(paymentAmount)}
              </p>
            )}
          </FieldData>
        </div>
      </ClickableCardContainer.LinkContent>
      {extended && (
        <ClickableCardContainer.AdditionalContent>
          <div className={styles.additionalContent}>
            <Link
              passHref={true}
              isInternal
              href={
                getStepInfo({ step: defaultStep, policyNumber, planCode })
                  .stepUrl
              }
              className={clsx(
                ottpPaymentDisabled && styles.disabledTransaction
              )}
              role={ottpPaymentDisabled ? 'link' : ''}
              aria-disabled={ottpPaymentDisabled}
            >
              <Button mode="link" size="small" disabled={ottpPaymentDisabled}>
                Make a one-time payment
              </Button>
            </Link>
            {systematicPremiumFeatureFlag && (
              <>
                <Link
                  passHref={true}
                  isInternal
                  href={{
                    pathname: `/coverage/policies/${planCode}/${policyNumber}/systematic-premium/amount`,
                  }}
                  role={ottpPaymentDisabled ? 'link' : ''}
                  aria-disabled={ottpPaymentDisabled}
                >
                  <Button
                    mode="link"
                    size="small"
                    disabled={!manageAutopayEnabled}
                  >
                    {manageAutopayLinkDisplay}
                  </Button>
                </Link>
                <CancelAutopaySidesheet
                  arrangementId={arrangementId}
                  disabled={!cancelAutopayEnabled}
                  frequency={frequency}
                  paymentAmount={paymentAmount || 0}
                  planCode={planCode}
                  policyNumber={policyNumber}
                  nextActivityDate={nextActivityDate}
                />
              </>
            )}
          </div>
        </ClickableCardContainer.AdditionalContent>
      )}
    </ClickableCardContainer>
  );
};
