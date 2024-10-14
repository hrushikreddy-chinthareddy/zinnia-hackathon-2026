import { PolicyStatus, Status } from '@zinnia/api-types/types/sor';
import { Label, Icon, IconType, Link } from '@zinnia/bloom/components';
import clsx from 'clsx';
import dayjs from 'dayjs';

import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import MockMessage from '@/components/MockMessage';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { UpcomingPremiumPopover } from '@/components/policy-overview/UpcomingPremiumPopover';
import { getUpcomingPremium } from '@/services';
import { getPremiumEligibility } from '@/services/bpm';
import { getFeatureFlags } from '@/services/feature-flags';
import { formatUSDollars } from '@/utils/currency';
import { isNullEmptyOrUndefined } from '@/utils/data';
import { standardDateMonthDayYear } from '@/utils/dates';
import { logError } from '@/utils/logging/server-logging';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';
import { DEFAULT_UNAVAILABLE_STRING } from '@/utils/strings';

import styles from './PolicyOverview.module.css';
import { defaultStep, getStepInfo } from '../one-time-premium-payment/steps';

const UPCOMING_PREMIUM = 'Premiums';

export const UpcomingPremium = async ({
  planCode,
  policyNumber,
  extended,
  title = UPCOMING_PREMIUM,
}: {
  planCode: string;
  policyNumber: string;
  extended?: boolean;
  title?: string;
}) => {
  const featureFlagDecisions = await getFeatureFlags();

  const premDataCalls = [
    getUpcomingPremium({
      planCode,
      policyNumber,
    }),
  ] as Promise<any>[];

  if (featureFlagDecisions?.[FEATURE_FLAGS.ONE_TIME_PREMIUM_PAYMENT]) {
    premDataCalls.push(
      getPremiumEligibility({
        planCode,
        policyNumber,
      })
    );
  }

  const [upcomingResult, ottpResult] = await Promise.allSettled(premDataCalls);

  if (upcomingResult?.status === 'rejected') {
    logError('Error fetching upcoming premium', upcomingResult.reason);
  }

  const { data, error } =
    upcomingResult?.status === 'fulfilled'
      ? upcomingResult.value
      : { data: null, error: null };

  if (ottpResult?.status === 'rejected') {
    logError('Error fetching upcoming premium', ottpResult.reason);
  }

  const ottpPaymentDisabled =
    ottpResult?.status !== 'fulfilled' ||
    ottpResult?.value?.data?.reason ||
    ottpResult?.value?.error;

  if (error) {
    return (
      <div className="space-mb-gap-lg">
        <MockMessage />
        <NoDataAvailable
          iconType={IconType.AUTOPAY}
          message="There is currently no premium payments data available."
        />
      </div>
    );
  }

  const {
    amount,
    nextActivityDate,
    nextActivityStatus,
    policyStatus,
    productType,
  } = data!;
  let currentAmount = amount;

  if (policyStatus === PolicyStatus.LAPSE) {
    currentAmount = 0;
  }

  const paymentCaption = () => {
    if (policyStatus === PolicyStatus.LAPSE) {
      return <span className={styles.error}>Payment</span>;
    }

    const upcomingPaymentValid =
      nextActivityDate &&
      nextActivityStatus === Status.ACTIVE &&
      // There was a bug in the back end code, where these programs couldn't be end dated at first, so they
      // were setting the end date to 2044 OR setting the date to  a way to indicate they were no longer active. That has since been
      // updated (10/2024) and we can rely on the status to indicate if the upcoming payment is active, HOWEVER,
      // there are still some in the system that are "inactive" based on their date. We are not accounting for any with
      // 2044 dates here, but are checking if date is in the past.
      dayjs(nextActivityDate).isAfter(dayjs());

    return upcomingPaymentValid
      ? `Autopay on ${standardDateMonthDayYear(nextActivityDate)}`
      : 'No premium scheduled';
  };

  const upcomingPremContent = isNullEmptyOrUndefined(currentAmount) ? (
    <p className="typography-content-body-sm">{DEFAULT_UNAVAILABLE_STRING}</p>
  ) : (
    <p className="typography-content-value">{formatUSDollars(currentAmount)}</p>
  );

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
                  <UpcomingPremiumPopover
                    key="upcoming-popover"
                    productType={productType}
                  />,
                ]}
              >
                {title}
              </Label>
            }
            caption={paymentCaption()}
          >
            {upcomingPremContent}
          </FieldData>
        </div>
      </ClickableCardContainer.LinkContent>
      {extended && (
        <ClickableCardContainer.AdditionalContent>
          {featureFlagDecisions?.[FEATURE_FLAGS.ONE_TIME_PREMIUM_PAYMENT] && (
            <div className={styles.additionalContent}>
              {/* TODO: once bloom link updates released, update this to use the new state prop rather than setting styles here*/}
              <Link
                size="small"
                href={
                  ottpPaymentDisabled
                    ? ''
                    : `${getStepInfo({ step: defaultStep, policyNumber, planCode }).stepUrl}`
                }
                text="Make a one-time payment"
                className={clsx(
                  ottpPaymentDisabled && styles.disabledTransaction
                )}
                role={ottpPaymentDisabled ? 'link' : ''}
                aria-disabled={ottpPaymentDisabled}
              />
            </div>
          )}
        </ClickableCardContainer.AdditionalContent>
      )}
    </ClickableCardContainer>
  );
};
