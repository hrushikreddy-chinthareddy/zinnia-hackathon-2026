import { TransactionResponse } from '@xd/api-types/dist/generated-types/bpm';
import { PolicyStatus, Status } from '@zinnia/api-types/types/sor';
import { Label, Icon, IconType, Button } from '@zinnia/bloom/components';
import clsx from 'clsx';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isSameOrAfter);

import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { Link } from '@/components/link/Link';
import MockMessage from '@/components/MockMessage';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { UpcomingPremiumPopover } from '@/components/policy-overview/UpcomingPremiumPopover';
import { getPremiumEligibility } from '@/services/bpm';
import { getSystematicProgramsEligibility } from '@/services/bpm/systematic-programs';
import { getFeatureFlags } from '@/services/feature-flags';
import { getUpcomingPremium } from '@/services/policy';
import { formatUSDollars } from '@/utils/currency';
import { isNullEmptyOrUndefined } from '@/utils/data';
import { standardDateMonthDayYear } from '@/utils/dates';
import { logError } from '@/utils/logging/log-fns';
import {
  buildCommonLogContext,
} from '@/utils/logging/server-logging';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';
import { DEFAULT_UNAVAILABLE_STRING } from '@/utils/strings';

import { CancelAutopaySidesheet } from './CancelAutopaySidesheet';
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
  const loggingContext = await buildCommonLogContext();
  const featureFlags = await getFeatureFlags();
  const systematicPremiumFeatureFlag =
    featureFlags?.[FEATURE_FLAGS.TRANSACTION_SYSTEMATIC_PREMIUM];

  const [upcomingResult, ottpResult, systematicProgramsEligibilityResult] =
    await Promise.allSettled([
      getUpcomingPremium(
        {
          planCode,
          policyNumber,
        },
        loggingContext
      ),
      getPremiumEligibility({
        planCode,
        policyNumber,
      }),
      getSystematicProgramsEligibility(
        {
          planCode,
          policyNumber,
        },
        loggingContext
      ),
    ]);

  if (upcomingResult?.status === 'rejected') {
    logError('Error fetching upcoming premium', upcomingResult.reason);
  }

  const { data, error } =
    upcomingResult?.status === 'fulfilled'
      ? upcomingResult.value
      : {
        data: null,
        error: {
          message: 'Error fetching upcoming premium',
          ...loggingContext,
        },
      };

  if (ottpResult?.status === 'rejected') {
    logError('Error fetching upcoming premium', ottpResult.reason);
  }

  const ottpPaymentDisabled =
    ottpResult?.status !== 'fulfilled' ||
    !!ottpResult?.value?.data?.reason ||
    !!ottpResult?.value?.error;

  const systematicPremiumEligible =
    systematicProgramsEligibilityResult.status === 'fulfilled' &&
    systematicProgramsEligibilityResult.value.data?.status ===
    TransactionResponse.status.SUCCESS;

  const showSetUpAutopay =
    systematicPremiumFeatureFlag && systematicPremiumEligible;

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
    arrangementId,
    nextActivityDate,
    nextActivityStatus,
    policyStatus,
    lineOfBusiness,
    frequency,
  } = data;

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
      dayjs(nextActivityDate).isSameOrAfter(dayjs(), 'day');

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
                    lineOfBusiness={lineOfBusiness}
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
            {showSetUpAutopay && (
              <>
                <Link
                  passHref={true}
                  isInternal
                  href={{
                    pathname: `/coverage/policies/${planCode}/${policyNumber}/systematic-premium/amount`,
                    query: {
                      arrangementId,
                    },
                  }}
                  role={ottpPaymentDisabled ? 'link' : ''}
                  aria-disabled={ottpPaymentDisabled}
                >
                  <Button
                    mode="link"
                    size="small"
                    disabled={!systematicPremiumEligible}
                  >
                    {arrangementId?.length ? 'Manage' : 'Set-up'} autopay
                  </Button>
                </Link>
                <CancelAutopaySidesheet
                  arrangementId={arrangementId}
                  disabled={!arrangementId.length}
                  frequency={frequency}
                  paymentAmount={amount}
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
