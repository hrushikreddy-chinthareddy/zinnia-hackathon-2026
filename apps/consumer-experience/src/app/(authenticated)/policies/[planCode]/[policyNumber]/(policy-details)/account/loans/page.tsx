import {
  Icon,
  IconType,
  Label,
  Popover,
} from '@zinnia/bloom/internal/components';
import { Metadata } from 'next';

import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { FieldData } from '@/components/field-data/FieldData';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { StatusIconText } from '@/components/status-icon-text/StatusIconText';
import { getPolicyLoanDetails } from '@/services';
import { PolicyRequestInputs } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';
import { standardDateMonthYear } from '@/utils/dates';
import { DEFAULT_UNAVAILABLE_STRING } from '@/utils/strings';

const pageTitle = 'Loans';

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

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
  const { data, error } = await getPolicyLoanDetails({
    planCode,
    policyNumber,
  });

  const loansData = () => {
    if (error || !data) {
      return <NoDataAvailable message={DEFAULT_UNAVAILABLE_STRING} />;
    }

    return (
      <>
        <p className="typography-content-body-sm">
          <span className="typography-content-body-sm-bold">
            {data.isEligible ? eligibleTextHighlight : ineligibleTextHighlight}{' '}
          </span>
          You can take a loan from your account value at any time, as long as
          funds are available. Keep in mind: Aside from incurring interest, a
          loan may reduce your coverage amount. But unlike other types of loans,
          a loan from your policy does not have to be paid back on a schedule.
        </p>
        <div className="card">
          <StatusIconText
            isEligible={data.isEligible}
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
                        This amount is how much you may borrow from the account
                        value of your policy. Keep in mind, loans have
                        consequences. Aside from incurring interest, a loan may
                        reduce your coverage amount.{' '}
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
                  <span>{`As of ${standardDateMonthYear(data.timestamp)}`}</span>
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
      <HeaderBreadcrumb title={pageTitle} />
      {loansData()}
      <CallForAssistance customInstruction="to begin the loan process." />
    </div>
  );
}
