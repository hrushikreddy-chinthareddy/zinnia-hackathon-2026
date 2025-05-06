import { FeatureType } from '@zinnia/api-types/types/sor';
import { Icon, IconType } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { Metadata } from 'next';

import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { LabelPopover } from '@/components/label-popover/LabelPopover';
import { Link } from '@/components/link/Link';
import { ValueWithPopover } from '@/components/value-with-popover/ValueWithPopover';
import { RouteKey, getPageTitle } from '@/route-map';
import {
  ApiResponse,
  getPolicyStatusDetails,
  getPolicyWithdrawalDetails,
} from '@/services';
import { PolicyRequestInputs, PolicyWithdrawals } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';
import { DEFAULT_DATE_FORMAT } from '@/utils/dates';

import styles from './withdrawals.module.css';

const pageTitle = getPageTitle(RouteKey.WITHDRAWALS);
// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

export default async function Withdrawals({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { planCode, policyNumber } = params;

  const [withdrawalDetails, policyStatus] = await Promise.allSettled([
    getPolicyWithdrawalDetails({
      planCode,
      policyNumber,
    }),

    getPolicyStatusDetails({
      planCode,
      policyNumber,
    }),
  ]);

  const summaryData =
    withdrawalDetails.status === 'fulfilled'
      ? withdrawalDetails?.value
      : ({} as ApiResponse<PolicyWithdrawals>);

  const policyStatusData =
    policyStatus?.status === 'fulfilled' ? policyStatus.value.data : null;
  const isFreelook = policyStatusData?.policyStatus === FeatureType.FREELOOK;

  const { data } = summaryData;

  // min distribution deadline is always the last day of the year
  const lastDateOfYear = dayjs().endOf('year').format(DEFAULT_DATE_FORMAT);

  const accountWithdrawalPercentage =
    data && data.freeWithdrawalAmount && data.endingAccountValue
      ? ((data.freeWithdrawalAmount / data.endingAccountValue) * 100).toFixed(2)
      : '0';

  return (
    <div className="container">
      <ClickableCardContainer>
        <ValueWithPopover
          value={formatUSDollars(data?.freeWithdrawalAmount)}
          label="Free withdrawal amount"
          emphasizeValue
          popoverElement={
            <LabelPopover title={'Free withdrawal amount'}>
              This is the amount you can withdraw from your annuity's account
              value right now without paying fees to do so. It's
              {accountWithdrawalPercentage}% of your current account value.
            </LabelPopover>
          }
        />
      </ClickableCardContainer>

      <ClickableCardContainer>
        <div className={styles.distributionInfo}>
          <ValueWithPopover
            value={formatUSDollars(data?.requiredMinimumDistributionAmount)}
            label="Required min distribution amount"
            emphasizeValue
            popoverElement={
              <LabelPopover title={'Required min distribution amount'}>
                <p>
                  Once you reach age 73, the IRS requires you to withdraw a
                  minimum amount from tax-advantaged retirement accounts. This
                  withdrawals are called “required minimum distributions.” Every
                  year, we calculate an amount for you based on IRS rules. This
                  is your current year's RMD amount for this contract.
                </p>
                <br />
                <p>
                  To learn more about the requirements, visit the{' '}
                  <Link
                    isNativeAnchorTag
                    target="_blank"
                    className={styles.link}
                    href="https://www.irs.gov/retirement-plans/retirement-plan-and-ira-required-minimum-distributions-faqs"
                    rel="noopener noreferrer"
                  >
                    IRS website
                    <Icon type={IconType.EXTERNAL_LINK} small />
                  </Link>
                </p>
              </LabelPopover>
            }
          />
          <ValueWithPopover
            value={lastDateOfYear}
            label="Required min distribution deadline"
            popoverElement={
              <LabelPopover title={'Required min distribution amount'}>
                <p>
                  This is the deadline, set by the IRS, for you to satisfy the
                  required minimum distribution requirements.
                </p>
                <br />
                <p>
                  To learn more about the requirements, visit the{' '}
                  <Link
                    isNativeAnchorTag
                    target="_blank"
                    className={styles.link}
                    href="https://www.irs.gov/retirement-plans/retirement-plan-and-ira-required-minimum-distributions-faqs"
                    rel="noopener noreferrer"
                  >
                    IRS website
                    <Icon
                      className={styles.icon}
                      type={IconType.EXTERNAL_LINK}
                      small
                    />
                  </Link>
                </p>
              </LabelPopover>
            }
          />
        </div>
      </ClickableCardContainer>
      <CallForAssistance
        callToAction={
          isFreelook
            ? `You can't take a withdrawal until your free look period ends. Questions?`
            : 'Taking a withdrawal is coming soon. For now, '
        }
        contactPrompt={isFreelook ? undefined : 'call'}
        customInstruction="."
      />
    </div>
  );
}
