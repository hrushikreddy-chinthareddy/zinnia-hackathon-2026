import {
  Icon,
  IconType,
  Label,
  Popover,
} from '@zinnia/bloom/components';
import { Metadata } from 'next';

import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { FieldData } from '@/components/field-data/FieldData';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { StatusIconText } from '@/components/status-icon-text/StatusIconText';
import { RouteKey, getPageTitle } from '@/route-map';
import { getPolicyWithdrawalDetails } from '@/services';
import { PolicyRequestInputs } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';
import { isNullEmptyOrUndefined } from '@/utils/data';
import { dayOfMonthWithOrdinal, standardDateMonthDayYear } from '@/utils/dates';
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
  const { data, error } = await getPolicyWithdrawalDetails({
    planCode,
    policyNumber,
  });

  const withdrawalsData = () => {
    if (error || !data) {
      return <NoDataAvailable message={DEFAULT_UNAVAILABLE_STRING} />;
    }

    // Eligibility is only shown as false if the value is truly false. If it is null or undefined,
    // we want to still show "eligible" so that the user can still try to take the withdrawal
    // and the backend system can determine true eligibility
    const eligibilityIsFalse = data.isEligibleForWithdrawals === false;

    return (
      <>
        <p className="typography-content-body-sm">
          <span className="typography-content-body-sm-bold">
            {eligibilityIsFalse
              ? ineligibleTextHighlight
              : eligibleTextHighlight}{' '}
          </span>
          Once eligible, you may withdraw for any reason. Withdrawals up to a
          certain amount typically don't have tax consequences. Tax consequences
          may apply to any earned interest you withdraw. (Always consult with a
          tax professional before withdrawing.) Also note that withdrawing from
          the account value may reduce your death benefit.
        </p>
        <div className="card">
          <StatusIconText
            isEligible={!eligibilityIsFalse}
            showIcon
            className="typography-content-body-bold mb-lg"
          />
          <div className="column-card">
            {/* AVAILABLE TO WITHDRAW */}
            <FieldData
              caption={
                <span>{`As of ${standardDateMonthDayYear(data.effectiveDate)}`}</span>
              }
              Label={
                <Label
                  interactiveElements={[
                    <Popover
                      key={AVAILBLE_TO_WITHDRAW}
                      title={AVAILBLE_TO_WITHDRAW}
                      trigger={
                        <Icon
                          type={IconType.CIRCLE_INFO}
                          color="var(--color-base-icon-icon-tooltip, #ff7500)"
                          width={16}
                          height={16}
                        />
                      }
                    >
                      <div>
                        <p>
                          If eligible, this is the maximum amount available for
                          withdrawal.{' '}
                        </p>
                        <p className="my-lg">
                          {`Withdrawals have consequences. Withdrawing the maximum amount available may lead to policy lapse, if you don’t make a payment by the next monthiversary. (Your policy’s
                  monthiversary happens every month on the ${dayOfMonthWithOrdinal(data.nextMonthiversaryDate)}.)`}
                        </p>
                        <p>
                          Depending on the amount, a partial withdrawal can
                          reduce your coverage amount and may be taxable.
                        </p>
                      </div>
                    </Popover>,
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
                    <Popover
                      key={ALL_TIME_WITHDRAWALS}
                      title={ALL_TIME_WITHDRAWALS}
                      trigger={
                        <Icon
                          type={IconType.CIRCLE_INFO}
                          color="var(--color-base-icon-icon-tooltip, #ff7500)"
                          width={16}
                          height={16}
                        />
                      }
                    >
                      <p>
                        This is the total amount you’ve withdrawn over the life
                        of your policy.
                      </p>
                    </Popover>,
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

            {/* COVERAGE PRESERAVTION LIMIT */}
            <FieldData
              Label={
                <Label
                  interactiveElements={[
                    <Popover
                      key={COVERAGE_PRESERVATION_LIMIT}
                      title={COVERAGE_PRESERVATION_LIMIT}
                      trigger={
                        <Icon
                          type={IconType.CIRCLE_INFO}
                          color="var(--color-base-icon-icon-tooltip, #ff7500)"
                          width={16}
                          height={16}
                        />
                      }
                    >
                      <p>
                        You can withdraw this amount without reducing your
                        coverage amount.
                      </p>
                    </Popover>,
                  ]}
                >
                  {COVERAGE_PRESERVATION_LIMIT}
                </Label>
              }
            >
              <p className="typography-content-value">
                {formatUSDollars(data.annualWithdrawalLimitNoCoverageDecrease)}
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
                    <Popover
                      key={ANNUAL_WITHDRAWALS_REMAINING}
                      title={ANNUAL_WITHDRAWALS_REMAINING}
                      trigger={
                        <Icon
                          type={IconType.CIRCLE_INFO}
                          color="var(--color-base-icon-icon-tooltip, #ff7500)"
                          width={16}
                          height={16}
                        />
                      }
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
                    </Popover>,
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
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="container">
      {withdrawalsData()}
      <CallForAssistance customInstruction="to make a withdrawal." />
    </div>
  );
}
