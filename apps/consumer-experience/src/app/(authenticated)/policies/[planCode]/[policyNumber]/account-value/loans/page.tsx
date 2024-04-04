import {
  Icon,
  IconType,
  Label,
  Popover,
} from '@zinnia/bloom/internal/components';

import { FieldData } from '@/components/field-data/FieldData';
import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';
import { InfoCard } from '@/components/info-card/InfoCard';
import { StatusIconText } from '@/components/status-icon-text/StatusIconText';
import { PolicyRequestInputs } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';
import { standardDateMonthYear } from '@/utils/dates';

// TODO: update with real data
const montheversary = '2022-02-01';
const isEligible = false;

const AVAILABLE_TO_BORROW = 'Available to borrow';
const TOTAL_LOAN_BALANCE = 'Total loan balance';

const eligibleTextHighlight =
  'Your account value is eligible for a loan right now.';
const ineligibleTextHighlight =
  'Hang tight! Your account value isn’t eligible for a loan right now.';

export default async function Withdrawals({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { planCode, policyNumber } = params;

  return (
    <div className="container">
      <HeaderBreadcrumb title="Loans" />
      <HeaderPolicyDetails planCode={planCode} policyNumber={policyNumber} />
      <div className="card-container">
        <InfoCard iconType={IconType.LIGHTBULB}>
          <p>
            <span className="typography-content-body-sm-bold">
              {isEligible ? eligibleTextHighlight : ineligibleTextHighlight}{' '}
            </span>
            You can take a loan from your account value at any time, as long as
            funds are available. Keep in mind: Aside from incurring interest, a
            loan may reduce your coverage amount. But unlike other types of
            loans, a loan from your policy does not have to be paid back on a
            schedule.
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
              Label={
                <Label
                  interactiveElements={[
                    <Popover
                      key={AVAILABLE_TO_BORROW}
                      title={AVAILABLE_TO_BORROW}
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
                        monthaversary happens every month on the ${standardDateMonthYear(montheversary)}.)`}
                        </p>
                        <p>
                          Depending on the amount, a partial withdrawal can
                          reduce your coverage amount and may be taxable.
                        </p>
                      </div>
                    </Popover>,
                  ]}
                >
                  {AVAILABLE_TO_BORROW}
                </Label>
              }
            >
              <p className="typography-content-value">
                {formatUSDollars(250439.23)}
              </p>
            </FieldData>
            <FieldData
              caption={
                <span>As of ${standardDateMonthYear('2023-06-12')}</span>
              }
              Label={
                <Label
                  interactiveElements={[
                    <Popover
                      key={TOTAL_LOAN_BALANCE}
                      title={TOTAL_LOAN_BALANCE}
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
                        monthaversary happens every month on the ${standardDateMonthYear(montheversary)}.)`}
                        </p>
                        <p>
                          Depending on the amount, a partial withdrawal can
                          reduce your coverage amount and may be taxable.
                        </p>
                      </div>
                    </Popover>,
                  ]}
                >
                  {TOTAL_LOAN_BALANCE}
                </Label>
              }
            >
              <p className="typography-content-value">
                {formatUSDollars(250439.23)}
              </p>
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
        to being the loan process
      </p>
      <Footer />
    </div>
  );
}
