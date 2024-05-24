import {
  Icon,
  IconType,
  Label,
  Popover,
} from '@zinnia/bloom/internal/components';
import { Metadata } from 'next';

import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { FieldData } from '@/components/field-data/FieldData';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { StatusIconText } from '@/components/status-icon-text/StatusIconText';
import { RouteKey, getPageTitle } from '@/route-map';
import { getPolicyLoanDetails } from '@/services';
import { PolicyRequestInputs } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';
import { standardDateMonthDayYear } from '@/utils/dates';
import { DEFAULT_UNAVAILABLE_STRING } from '@/utils/strings';

const pageTitle = getPageTitle(RouteKey.LOANS);
// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

const AVAILABLE_TO_BORROW = 'Available to borrow';
const TOTAL_LOAN_BALANCE = 'Total loan balance';

const eligibleTextHighlight = 'Your policy is eligible for a loan right now.';
const ineligibleTextHighlight =
  'Hang tight! Your account value isn’t eligible for a loan right now.';

export default async function Loans({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { planCode, policyNumber } = params;
  const { data, error } = await getPolicyLoanDetails({
    planCode,
    policyNumber,
  });

  const loansData = () => {
    if (error || !data) {
      return <NoDataAvailable message={DEFAULT_UNAVAILABLE_STRING} />;
    }

    // Eligibility is only shown as false if the value is truly false. If it is null or undefined,
    // we want to still show "eligible" so that the user can still try to take the withdrawal
    // and the backend system can determine true eligibility
    const eligibleIsFalse = data.isEligible === false;

    return (
      <>
        <p className="typography-content-body-sm">
          <span className="typography-content-body-sm-bold">
            {!eligibleIsFalse ? eligibleTextHighlight : ineligibleTextHighlight}{' '}
          </span>
          When you are eligible, you can take a loan from your policy at any
          time, as long as funds are available. Keep in mind: aside from
          incurring interest, a loan may reduce your coverage amount. But unlike
          other types of loans, a loan from your policy does not have to be paid
          back on a schedule.
        </p>
        <div className="card">
          <StatusIconText
            isEligible={!eligibleIsFalse}
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
                      <p>
                        This amount is how much you may borrow from your policy.
                        Keep in mind, loans have consequences. Aside from
                        incurring interest, a loan may reduce your death
                        benefit. If you surrender your policy or your policy
                        lapses while you have an outstanding loan, there may
                        also be tax consequences.
                      </p>
                    </Popover>,
                  ]}
                >
                  {AVAILABLE_TO_BORROW}
                </Label>
              }
            >
              <p className="typography-content-value">
                {formatUSDollars(data.maximumLoanAmount)}
              </p>
            </FieldData>
            {!!data.totalLoanBalance && (
              <FieldData
                caption={
                  <span>{`As of ${standardDateMonthDayYear(data.effectiveDate)}`}</span>
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
                        <p>
                          This amount shows your current balance for all loans
                          you’ve already taken.
                        </p>
                      </Popover>,
                    ]}
                  >
                    {TOTAL_LOAN_BALANCE}
                  </Label>
                }
              >
                <p className="typography-content-value">
                  {formatUSDollars(data.totalLoanBalance)}
                </p>
              </FieldData>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="container">
      {loansData()}
      <CallForAssistance customInstruction="to begin the loan process." />
    </div>
  );
}
