import { PolicyFeature } from '@zinnia/api-types/types/sor';
import { Label } from '@zinnia/bloom/components';
import { Metadata } from 'next';

import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { FieldData } from '@/components/field-data/FieldData';
import { LabelPopover } from '@/components/label-popover/LabelPopover';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { StatusIconText } from '@/components/status-icon-text/StatusIconText';
import { RouteKey, getPageTitle } from '@/route-map';
import {
  ApiResponse,
  getPolicyLoanDetails,
  getPolicyStatusDetails,
} from '@/services';
import { getLoanEligibility } from '@/services/bpm';
import { PolicyLoans, PolicyRequestInputs } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';
import {
  convertKebabedDateString,
  standardDateMonthDayYear,
} from '@/utils/dates';
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
  const [loanDetails, loanEligibility, policyStatus] = await Promise.allSettled(
    [
      getPolicyLoanDetails({
        planCode,
        policyNumber,
      }),
      getLoanEligibility({
        planCode,
        policyNumber,
      }),
      getPolicyStatusDetails({
        planCode,
        policyNumber,
      }),
    ]
  );

  const summaryData =
    loanDetails.status === 'fulfilled'
      ? loanDetails?.value
      : ({} as ApiResponse<PolicyLoans>);
  const loanEligibilityData =
    loanEligibility?.status === 'fulfilled'
      ? loanEligibility.value?.data?.isEligible
      : null;

  const policyStatusData =
    policyStatus?.status === 'fulfilled' ? policyStatus.value.data : null;
  const isFreelook =
    policyStatusData?.policyStatus ===
    ('FREELOOK' as PolicyFeature.featureType);

  const { data, error } = summaryData;

  const loansData = () => {
    if (error || !data) {
      return <NoDataAvailable message={DEFAULT_UNAVAILABLE_STRING} />;
    }

    return (
      <>
        <p className="typography-content-body-sm">
          {loanEligibilityData != null && (
            <span className="typography-content-body-sm-bold">
              {loanEligibilityData && !isFreelook
                ? eligibleTextHighlight
                : ineligibleTextHighlight}{' '}
            </span>
          )}
          When you are eligible, you can take a loan from your policy at any
          time, as long as funds are available. Keep in mind: aside from
          incurring interest, a loan may reduce your coverage amount. But unlike
          other types of loans, a loan from your policy does not have to be paid
          back on a schedule.
        </p>
        <div className="card">
          <StatusIconText
            isEligible={loanEligibilityData && !isFreelook}
            showIcon
            className="typography-content-body-bold mb-lg"
          />
          <div className="column-card">
            <FieldData
              Label={
                <Label
                  interactiveElements={[
                    <LabelPopover
                      key={AVAILABLE_TO_BORROW}
                      title={AVAILABLE_TO_BORROW}
                    >
                      <p>
                        This amount is how much you may borrow from your policy.
                      </p>
                    </LabelPopover>,
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
                      <LabelPopover
                        key={TOTAL_LOAN_BALANCE}
                        title={TOTAL_LOAN_BALANCE}
                      >
                        <p>
                          This amount shows your current balance for all loans
                          you’ve already taken.
                        </p>
                      </LabelPopover>,
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
      <CallForAssistance
        callToAction={
          isFreelook
            ? `You can't take a loan until your free look period ends on ${convertKebabedDateString(policyStatusData.endDate)}. Questions?`
            : 'Taking a loan is coming soon. For now, '
        }
        contactPrompt={isFreelook ? undefined : 'call'}
        customInstruction="."
      />
    </div>
  );
}
