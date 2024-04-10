import {
  Icon,
  IconType,
  Label,
  Popover,
} from '@zinnia/bloom/internal/components';

import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { FieldData } from '@/components/field-data/FieldData';
import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';
import { InfoCard } from '@/components/info-card/InfoCard';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { StatusIconText } from '@/components/status-icon-text/StatusIconText';
import { getPolicyWithdrawalDetails } from '@/services';
import { PolicyRequestInputs } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';
import { isNullEmptyOrUndefined } from '@/utils/data';
import { dayOfMonthWithOrdinal, standardDateMonthYear } from '@/utils/dates';
import { DEFAULT_UNAVAILABLE_STRING, pluralize } from '@/utils/strings';

const AVAILBLE_TO_WITHDRAW = 'Available to withdraw';
const ALL_TIME_WITHDRAWALS = 'All-time withdrawals';
const ANNUAL_WITHDRAWALS_REMAINING = 'Annual withdrawals remaining';
const AVAILABLE_WITHDRAW_TAX_FREE = 'Available to withdraw tax-free';
const COVERAGE_PRESERVATION_LIMIT = 'Coverage preservation limit';

const eligibleTextHighlight =
  'Good news! Your account value is eligible for withdrawal.';
const ineligibleTextHighlight =
  'Hang tight! Your account value isn’t eligible for withdrawal at the moment.';

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

    return (
      <div className="card-container">
        <InfoCard iconType={IconType.LIGHTBULB}>
          <p>
            <span className="typography-content-body-sm-bold">
              {data.isEligibleForWithdrawals
                ? eligibleTextHighlight
                : ineligibleTextHighlight}{' '}
            </span>
            Once eligible, you may withdraw for any reason. Withdrawals are tax
            free up to a certain amount. You only pay taxes on any earned
            interest you withdraw. Also note that withdrawing from the account
            value may reduce your coverage amount.
          </p>
        </InfoCard>
        <div className="card">
          <StatusIconText
            isEligible={data.isEligibleForWithdrawals}
            showIcon
            className="typography-content-body-bold mb-lg"
          />
          <div className="column-card">
            {/* AVAILABLE TO WITHDRAW */}
            <FieldData
              caption={
                <span>{`As of ${standardDateMonthYear(data.withdrawalAllowedStartDate)}`}</span>
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
                          {`Withdrawals have consequences. Withdrawing the full
                  amount can surrender the policy, if you don’t make a
                  payment by the next monthaversary. (Your policy’s
                  monthaversary happens every month on the ${dayOfMonthWithOrdinal(data.nextMonthiversaryDate)}.)`}
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

            {/* AVAILABLE WITHDRAWAL TAX FREE */}
            <FieldData
              Label={
                <Label
                  interactiveElements={[
                    <Popover
                      key={AVAILABLE_WITHDRAW_TAX_FREE}
                      title={AVAILABLE_WITHDRAW_TAX_FREE}
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
                        You can withdraw up to this amount—also known as your
                        “cost basis”— without paying taxes. Your cost basis=how
                        much you’ve paid in premiums so far during the life of
                        your policy. You only need to pay taxes on interest
                        you’ve earned.
                      </p>
                    </Popover>,
                  ]}
                >
                  {AVAILABLE_WITHDRAW_TAX_FREE}
                </Label>
              }
            >
              <p className="typography-content-value">WHAT IS THIS VALUE??</p>
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
                          {`At this time, you could withdraw ${data.annualWithdrawalsRemaining} more time(s) during policy year. Your policy year ends on ${standardDateMonthYear(data.nextAnniversaryDate)}.`}
                        </p>
                        <p>
                          During the vesting period (the first 10 years of your
                          policy), you can only withdraw one time during each
                          policy year. After that, you may withdraw up to 12
                          times in a policy year.
                        </p>
                      </div>
                    </Popover>,
                  ]}
                >
                  {ANNUAL_WITHDRAWALS_REMAINING}
                </Label>
              }
            >
              <p className="typography-content-value">{`${data.annualWithdrawalsRemaining} left`}</p>
            </FieldData>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <HeaderBreadcrumb title="Withdrawals" />
      <HeaderPolicyDetails planCode={planCode} policyNumber={policyNumber} />
      {withdrawalsData()}
      <CallForAssistance customInstruction="to make a withdrawal." />

      <Footer />
    </div>
  );
}
