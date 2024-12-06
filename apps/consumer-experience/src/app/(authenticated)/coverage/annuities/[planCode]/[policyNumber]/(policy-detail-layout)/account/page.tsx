import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';
import { Metadata } from 'next';

import { AccountValue } from '@/components/account-value/AccountValue';
import { AdditionalAccountValueLinks } from '@/components/account-value/AdditionalAccountValueLinks';
import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FreeWithdrawalValuePopover } from '@/components/free-withdrawal-value/FreeWithdrawalValuePopover';
import { LabelPopover } from '@/components/label-popover/LabelPopover';
import { ValueWithPopover } from '@/components/value-with-popover/ValueWithPopover';
import { RouteKey, getPageTitle } from '@/route-map';
import { getPolicyAccountValue } from '@/services';
import { getFundDetails } from '@/services/funds';
import { LineOfBusinessPath } from '@/types';
import { PolicyRequestInputs } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';
import { DEFAULT_DATE_FORMAT } from '@/utils/dates';

import styles from './account.module.css';

const pageTitle = getPageTitle(RouteKey.ACCOUNT);
// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

export default async function AccountValuePage({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { planCode, policyNumber } = params;

  const { data: accountValueData, error: accountValueError } =
    await getPolicyAccountValue({
      planCode,
      policyNumber,
    });

  const { data: fundData } = await getFundDetails({
    carrierId: accountValueData?.carrierId,
    fundId: accountValueData?.fundId,
  });

  if (accountValueError || !accountValueData) {
    return null;
  }

  const {
    freeWithdrawalAmount,
    endingAccountValue,
    cumulativeGrossDeathBenefitAmount,
    totalYearToDatePremiumAmount,
    withdrawalAllowedStartDate,
    interestGuaranteedPeriod,
    renewalDate,
  } = accountValueData!;

  const interestRate = `${fundData?.fixedFund?.interestRate}%` || null;
  const formattedRenewalDate = renewalDate
    ? dayjs(renewalDate).format(DEFAULT_DATE_FORMAT)
    : null;

  // calc withdrawal percentage by taking free withdrawal amount and dividing by ending account value
  const accountWithdrawalPercentage =
    freeWithdrawalAmount && endingAccountValue
      ? ((freeWithdrawalAmount / endingAccountValue) * 100).toFixed(2)
      : '0';

  //If withdrawal amount is greater than 0 and also if we're past the withdrawal start date
  const canShowWithdrawal =
    freeWithdrawalAmount != null &&
    freeWithdrawalAmount > 0 &&
    withdrawalAllowedStartDate !== null &&
    dayjs().isAfter(dayjs(withdrawalAllowedStartDate));

  // should show the annuitization prompt only if after the renewalDate
  const showAnnuitizationPrompt = dayjs().isAfter(dayjs(formattedRenewalDate));

  return (
    <div className="container">
      <div className="card-container">
        <ClickableCardContainer>
          <div className={styles.accountValueCard}>
            <AccountValue planCode={planCode} policyNumber={policyNumber} />
            <div className={styles.accountValueDetails}>
              <ValueWithPopover
                className={styles.accountAccountValueCell}
                value={interestRate}
                label="Interest rate"
                popoverElement={
                  <LabelPopover title={'Interest Rate'}>
                    This is the annual rate of growth you're currently earning
                    on the money in your annuity. Your rate is guaranteed for{' '}
                    {interestGuaranteedPeriod} years.
                  </LabelPopover>
                }
              />
              <ValueWithPopover
                value={formattedRenewalDate}
                label="Renewal date"
                className={styles.accountAccountValueCell}
                popoverElement={
                  <LabelPopover title={'Renewal Date'}>
                    This is the date your guarantee period ends. After this
                    date, your annuity renews automatically with a new interest
                    rate. At this point, you can choose to annuitize your
                    contract (meaning start your payout phase), if you'd like.
                  </LabelPopover>
                }
              />
            </div>
          </div>
        </ClickableCardContainer>
        {!!canShowWithdrawal && (
          <ClickableCardContainer>
            <ClickableCardContainer.LinkContent
              linkTo={{
                url: `/coverage/${LineOfBusinessPath.ANNUITIES}/${planCode}/${policyNumber}/account/withdrawals`,
                label: 'go to free withdrawal page',
              }}
            >
              <ValueWithPopover
                value={formatUSDollars(freeWithdrawalAmount)}
                label="Free withdrawal"
                emphasizeValue
                popoverElement={
                  <FreeWithdrawalValuePopover
                    percentValue={accountWithdrawalPercentage}
                  />
                }
              />
            </ClickableCardContainer.LinkContent>
          </ClickableCardContainer>
        )}

        <ClickableCardContainer>
          <ValueWithPopover
            value={formatUSDollars(cumulativeGrossDeathBenefitAmount)}
            label="Death benefit"
            emphasizeValue
            popoverElement={
              <LabelPopover title={'Death Benefit'}>
                This is the amount, inclusive of any additional riders or
                features, that will be available to your beneficiaries should
                you pass away.
              </LabelPopover>
            }
          />
        </ClickableCardContainer>
        <ClickableCardContainer>
          <ValueWithPopover
            value={formatUSDollars(totalYearToDatePremiumAmount)}
            label="Total premium"
            emphasizeValue
            popoverElement={
              <LabelPopover title={'Total Premium'}>
                This is the amount of money you've contributed to your account
                value to date.
              </LabelPopover>
            }
          />
        </ClickableCardContainer>
        {canShowWithdrawal && (
          <ClickableCardContainer>
            <ClickableCardContainer.LinkContent
              linkTo={{
                url: `/coverage/${LineOfBusinessPath.ANNUITIES}/${planCode}/${policyNumber}/account/withdrawals`,
                label: 'go to free withdrawal page',
              }}
            >
              <ValueWithPopover
                value={freeWithdrawalAmount}
                label="Free withdrawal"
                emphasizeValue
                popoverElement={
                  <FreeWithdrawalValuePopover
                    percentValue={accountWithdrawalPercentage}
                  />
                }
              />
            </ClickableCardContainer.LinkContent>
          </ClickableCardContainer>
        )}
        <AdditionalAccountValueLinks
          planCode={planCode}
          policyNumber={policyNumber}
          lineOfBusiness={LineOfBusiness.ANNUITY}
        />
        {showAnnuitizationPrompt && (
          <CallForAssistance
            callToAction="Ready to start payout?"
            customInstruction="to begin the process. "
          />
        )}
      </div>
    </div>
  );
}
