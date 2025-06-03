import { FeatureType } from '@zinnia/api-types/types/sor';
import { Button, Label } from '@zinnia/bloom/components';
import { Metadata } from 'next';

import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { FieldData } from '@/components/field-data/FieldData';
import { LabelPopover } from '@/components/label-popover/LabelPopover';
import { Link } from '@/components/link/Link';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { StatusIconText } from '@/components/status-icon-text/StatusIconText';
import { RouteKey, getPageTitle } from '@/route-map';
import {
  ApiResponse,
  getPolicyStatusDetails,
  getPolicyWithdrawalDetails,
} from '@/services';
import { getWithdrawalEligibility } from '@/services/bpm';
import { getFeatureFlags } from '@/services/feature-flags';
import { PolicyRequestInputs, PolicyWithdrawals } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';
import { isNullEmptyOrUndefined } from '@/utils/data';
import { standardDateMonthDayYear } from '@/utils/dates';
import { buildCommonLogContext } from '@/utils/logging/server-logging';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';
import {
  DEFAULT_ERROR_STRING,
  DEFAULT_UNAVAILABLE_STRING,
  pluralize,
} from '@/utils/strings';

const pageTitle = getPageTitle(RouteKey.WITHDRAWALS);
// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

const AVAILBLE_TO_WITHDRAW = 'Available to withdraw';
const ALL_TIME_WITHDRAWALS = 'All-time withdrawals';
const ANNUAL_WITHDRAWALS_REMAINING = 'Annual withdrawals remaining';
const COVERAGE_PRESERVATION_LIMIT = 'Coverage preservation limit';

const eligibleTextHighlight =
  'Good news! Your policy is eligible for withdrawal.';
const ineligibleTextHighlight =
  'Hang tight! Your policy isn’t eligible for withdrawal at the moment.';

export default async function Withdrawals({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { planCode, policyNumber } = params;
  const loggingContext = await buildCommonLogContext();
  const [withdrawalDetails, withdrawalEligibility, policyStatus] =
    await Promise.allSettled([
      getPolicyWithdrawalDetails(
        {
          planCode,
          policyNumber,
        },
        loggingContext
      ),
      getWithdrawalEligibility(
        {
          planCode,
          policyNumber,
        },
        loggingContext
      ),
      getPolicyStatusDetails(
        {
          planCode,
          policyNumber,
        },
        loggingContext
      ),
    ]);

  const summaryData =
    withdrawalDetails.status === 'fulfilled'
      ? withdrawalDetails?.value
      : ({} as ApiResponse<PolicyWithdrawals>);

  const withdrawalEligibilityData =
    withdrawalEligibility?.status === 'fulfilled'
      ? withdrawalEligibility.value?.data?.data?.isEligible
      : null;

  const policyStatusData =
    policyStatus?.status === 'fulfilled' ? policyStatus.value.data : null;
  const isFreelook = policyStatusData?.policyStatus === FeatureType.FREELOOK;

  const { data, error } = summaryData;
  const withdrawalsData = async () => {
    if (error || !data) {
      return <NoDataAvailable message={DEFAULT_UNAVAILABLE_STRING} />;
    }
    const flags = await getFeatureFlags();
    const showPartialWithdrawalOneTime =
      flags?.[FEATURE_FLAGS.TRANSACTION_PARTIAL_WITHDRAWAL_ONETIME];
    return (
      <>
        <p className="typography-content-body-sm">
          {withdrawalEligibility != null && (
            <span className="typography-content-body-sm-bold">
              {withdrawalEligibilityData && !isFreelook
                ? eligibleTextHighlight
                : ineligibleTextHighlight}{' '}
            </span>
          )}
          Once eligible, you may withdraw for any reason. Withdrawals up to a
          certain amount typically don't have tax consequences. Tax consequences
          may apply to any earned interest you withdraw. (Always consult with a
          tax professional before withdrawing.) Also note that withdrawing from
          the account value may reduce your death benefit.
        </p>
        <div className="card">
          <StatusIconText
            isEligible={withdrawalEligibilityData && !isFreelook}
            showIcon
            className="typography-content-body-bold mb-lg"
          />
          <div className="column-card mb-lg">
            {/* AVAILABLE TO WITHDRAW */}
            {withdrawalEligibilityData && (
              <FieldData
                caption={
                  <span>{`As of ${standardDateMonthDayYear(data.effectiveDate)}`}</span>
                }
                Label={
                  <Label
                    interactiveElements={[
                      <LabelPopover
                        key={AVAILBLE_TO_WITHDRAW}
                        title={AVAILBLE_TO_WITHDRAW}
                      >
                        <div>
                          <p>
                            If eligible, this is the maximum amount available
                            for withdrawal.
                          </p>
                        </div>
                      </LabelPopover>,
                    ]}
                  >
                    {AVAILBLE_TO_WITHDRAW}
                  </Label>
                }
              >
                <p className="typography-content-value">
                  {formatUSDollars(data.maximumWithdrawalAmount)}
                </p>
              </FieldData>
            )}

            {/* ALL TIME WITHDRAWALS */}
            <FieldData
              caption={
                !isNullEmptyOrUndefined(data.numberOfWithdrawal) ? (
                  <span>
                    {pluralize(data.numberOfWithdrawal, 'withdrawal')}
                  </span>
                ) : (
                  ''
                )
              }
              Label={
                <Label
                  interactiveElements={[
                    <LabelPopover
                      key={ALL_TIME_WITHDRAWALS}
                      title={ALL_TIME_WITHDRAWALS}
                    >
                      <p>
                        This is the total amount you’ve withdrawn over the life
                        of your policy.
                      </p>
                    </LabelPopover>,
                  ]}
                >
                  {ALL_TIME_WITHDRAWALS}
                </Label>
              }
            >
              <p className="typography-content-value">
                {formatUSDollars(data.totalWithdrawalAmount)}
              </p>
            </FieldData>

            {withdrawalEligibilityData && (
              <>
                {/* COVERAGE PRESERAVTION LIMIT */}
                <FieldData
                  Label={
                    <Label
                      interactiveElements={[
                        <LabelPopover
                          key={COVERAGE_PRESERVATION_LIMIT}
                          title={COVERAGE_PRESERVATION_LIMIT}
                        >
                          <p>
                            You can withdraw this amount without reducing your
                            coverage amount.
                          </p>
                        </LabelPopover>,
                      ]}
                    >
                      {COVERAGE_PRESERVATION_LIMIT}
                    </Label>
                  }
                >
                  <p className="typography-content-value">
                    {formatUSDollars(
                      data.annualWithdrawalLimitNoCoverageDecrease
                    )}
                  </p>
                </FieldData>
                {/* ANNUAL WITHDRAWALS REMAINING */}
                <FieldData
                  caption={
                    !isNullEmptyOrUndefined(data.annualWithdrawalsTaken) ? (
                      <span>{`${data.annualWithdrawalsTaken} taken`}</span>
                    ) : (
                      ''
                    )
                  }
                  Label={
                    <Label
                      interactiveElements={[
                        <LabelPopover
                          key={ANNUAL_WITHDRAWALS_REMAINING}
                          title={ANNUAL_WITHDRAWALS_REMAINING}
                        >
                          <div>
                            <p className="mb-lg">
                              {`At this time, you could withdraw ${isNullEmptyOrUndefined(data.annualWithdrawalsRemaining) ? DEFAULT_ERROR_STRING : data.annualWithdrawalsRemaining} more time(s) during the policy year. Your policy year ends on ${standardDateMonthDayYear(data.nextAnniversaryDate)}.`}
                            </p>
                            <p>
                              {`During the vesting period (the first ${data.vestingDetails.vestingPeriod} years of your
                          policy which end${data.vestingDetails.policyHasVested ? 'ed' : 's'} on ${standardDateMonthDayYear(data.vestingDetails.matchVestingDate)}), you can only withdraw ${data.vestingDetails.maximumWithdrawalRequestDuringVestingPeriod} time during each
                          policy year. After that, you may withdraw up to ${data.vestingDetails.maximumWithdrawalRequestAfterVestingPeriod}
                          times in a policy year.`}
                            </p>
                          </div>
                        </LabelPopover>,
                      ]}
                    >
                      {ANNUAL_WITHDRAWALS_REMAINING}
                    </Label>
                  }
                >
                  <p className="typography-content-value">
                    {!isNullEmptyOrUndefined(data.annualWithdrawalsRemaining)
                      ? `${data.annualWithdrawalsRemaining} left`
                      : DEFAULT_ERROR_STRING}
                  </p>
                </FieldData>
              </>
            )}
          </div>
          <div
            className="column-card p-2xl"
            style={{
              backgroundColor: 'var(--color-base-surface-surface-secondary)',
              display: 'grid',
            }}
          >
            <div>
              {withdrawalEligibilityData &&
              !isFreelook &&
              showPartialWithdrawalOneTime ? (
                <Link
                  text="Make a withdrawal"
                  href={`/coverage/policies/${planCode}/${policyNumber}/withdrawal/information`}
                />
              ) : (
                <Button size="small" mode="link" disabled>
                  Make a withdrawal
                </Button>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="container">
      {withdrawalsData()}
      <CallForAssistance
        callToAction={
          withdrawalEligibilityData
            ? 'Taking a withdrawal is coming soon. For now, '
            : 'For questions about withdrawals, please '
        }
        contactPrompt="call"
        customInstruction="."
      />
    </div>
  );
}
