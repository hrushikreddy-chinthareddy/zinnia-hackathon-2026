import {
  Icon,
  IconType,
  Label,
  Popover,
} from '@zinnia/bloom/internal/components';
import dayjs from 'dayjs';

import { FieldData } from '@/components/field-data/FieldData';
import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';
import { InfoCard } from '@/components/info-card/InfoCard';
import { StatusIconText } from '@/components/status-icon-text/StatusIconText';
import { PolicyRequestInputs } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';
import { standardDateMonthYear } from '@/utils/dates';
import { numberWithOrdinal } from '@/utils/numbers';

// TODO: update with real data
const montheversary = '2022-02-01';
const isEligible = true;
const remainingWithdrawals = 2;
const policyAnniversaryDate = '2024-11-02';

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

  return (
    <div className="container">
      <HeaderBreadcrumb title="Withdrawals" />
      <HeaderPolicyDetails planCode={planCode} policyNumber={policyNumber} />
      <div className="card-container">
        <InfoCard iconType={IconType.LIGHTBULB}>
          <p>
            <span className="typography-content-body-sm-bold">
              {isEligible ? eligibleTextHighlight : ineligibleTextHighlight}{' '}
            </span>
            Once eligible, you may withdraw for any reason. Withdrawals are tax
            free up to a certain amount. You only pay taxes on any earned
            interest you withdraw. Also note that withdrawing from the account
            value may reduce your coverage amount.
          </p>
        </InfoCard>
        <div className="card">
          <StatusIconText
            isEligible={isEligible}
            showIcon
            className="typography-content-body-bold mb-lg"
          />
          <div className="column-card">
            <FieldData
              caption={
                <span>As of ${standardDateMonthYear('2023-06-12')}</span>
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
                        <p>
                          {`Withdrawals have consequences. Withdrawing the full
                        amount can surrender the policy, if you don’t make a
                        payment by the next monthaversary. (Your policy’s
                        monthaversary happens every month on the ${numberWithOrdinal(dayjs(montheversary).get('date'))}.)`}
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
                {formatUSDollars(250439.23)}
              </p>
            </FieldData>
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
              <p className="typography-content-value">
                {formatUSDollars(250439.23)}
              </p>
            </FieldData>
            <FieldData
              caption={<span>2 withdrawals</span>}
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
                {formatUSDollars(250439.23)}
              </p>
            </FieldData>
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
                {formatUSDollars(250439.23)}
              </p>
            </FieldData>
            <FieldData
              caption={<span>0 taken</span>}
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
                        <p>
                          {`At this time, you could withdraw ${remainingWithdrawals} more time(s) during policy year. Your policy year ends on ${standardDateMonthYear(policyAnniversaryDate)}.`}
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
              <p className="typography-content-value">2 left</p>
            </FieldData>
          </div>
        </div>
      </div>
      <p
        className="typography-content-body-bold"
        style={{ color: 'var(--Base-Text-text-primary, #212121)' }}
      >
        Call {/* TODO: create function to format this */}
        <a href={`tel:+${18002322222}`} className="typography-nav-links-inline">
          1-800-232-2222
        </a>{' '}
        to make a withdrawal
      </p>
      <Footer />
    </div>
  );
}
