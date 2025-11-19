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
import { stepsInfo } from '@/components/stepped-workflow/workflows/one-time-premium/steps';
import { getOneTimePremiumEligibility } from '@/services/bpm/one-time-premium-payment';
import { getFeatureFlags } from '@/services/feature-flags';
import { getPaymentMethods } from '@/services/payment-methods';
import { getUpcomingPremium, getPolicyTransactions } from '@/services/policy';
import { getPolicyFeatures } from '@/services/policy/features';
import { PendingPremiumTransactionType } from '@/types/policy';
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
  const featureFlags = await getFeatureFlags();

  const systematicPremiumFeatureFlag =
    featureFlags?.[FEATURE_FLAGS.TRANSACTION_SYSTEMATIC_PREMIUM];

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

  const pendingTransactionTypes = Object.values(
    PendingPremiumTransactionType
  ).map(String);

  const [transactionsResult, paymentMethodsResult] = await Promise.allSettled([
    getPolicyTransactions(
      {
        transactionTypes: pendingTransactionTypes,
        policyNumber,
        planCode,
        status: 'Pending',
        limit: 10,
        offset: 0,
        order: 'DESC',
      },
      loggingContext
    ),
    getPaymentMethods({ planCode, policyNumber }, loggingContext),
  ]);

  const transactionData =
    transactionsResult.status === 'fulfilled' && transactionsResult.value?.data
      ? transactionsResult.value.data
      : [];
  const paymentMethodsData =
    paymentMethodsResult.status === 'fulfilled' &&
    paymentMethodsResult.value?.data
      ? paymentMethodsResult.value.data
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
          correlationId={error.correlationId}
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

  const { scheduledPayment, premiumDue } = upcomingPaymentDetails({
    policyStatus,
    policyFeatures,
    upcomingPaymentAmount,
    upcomingPaymentValid,
    nextActivityDate,
    productType,
    transactions: transactionData,
    paymentMethods: paymentMethodsData,
    hasActiveAutopay: !!arrangementId, // If there's an arrangementId, autopay is active
  });

  return (
    <ClickableCardContainer>
      <ClickableCardContainer.LinkContent
        linkTo={{
          url: extended
            ? ''
            : `/coverage/policies/${planCode}/${policyNumber}/premium`, //annuities logic
          label: 'go to manage payments page',
          ctaText: 'Manage payments',
          showArrow: true,
        }}
      >
        <div className={styles.rowWrapper}>
          <div className={styles.content}>
            <Icon type={IconType.AUTOPAY} className={styles.icon} />
            {scheduledPayment && (
              <div className={styles.maxWidth50}>
                <FieldData
                  Label={<Label>{scheduledPayment.label}</Label>}
                  caption={scheduledPayment.caption}
                >
                  {isNullEmptyOrUndefined(scheduledPayment.amount) ? (
                    <p className="typography-content-body-sm">
                      {DEFAULT_UNAVAILABLE_STRING}
                    </p>
                  ) : (
                    <p className="typography-content-value">
                      {formatUSDollars(scheduledPayment.amount!)}
                    </p>
                  )}
                </FieldData>
              </div>
            )}
            <div className={scheduledPayment ? 'ml-xl' : ''}>
              <FieldData
                Label={
                  <Label
                    interactiveElements={[
                      <UpcomingPremiumPopover key="upcoming-popover" />,
                    ]}
                  >
                    {premiumDue.label}
                  </Label>
                }
                caption={premiumDue.caption}
              >
                <p className="typography-content-value">
                  {formatUSDollars(premiumDue.amount)}
                </p>
              </FieldData>
            </div>
          </div>
        </div>
      </ClickableCardContainer.LinkContent>
      {extended && (
        <ClickableCardContainer.AdditionalContent>
          <div className={styles.additionalContent}>
            <Link
              passHref={true}
              isInternal
              href={`premium/${Object.values(stepsInfo)?.[0]?.url ?? ''}`}
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
                  paymentAmount={scheduledPayment?.amount || 0}
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
