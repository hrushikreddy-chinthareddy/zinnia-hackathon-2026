import { PolicyFeature, ProductType } from '@zinnia/api-types/types/sor';
import clsx from 'clsx';
import { Metadata } from 'next';

import { AccountValue } from '@/components/account-value/AccountValue';
import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { StatusIconText } from '@/components/status-icon-text/StatusIconText';
import { RouteKey, getPageTitle } from '@/route-map';
import {
  ApiResponse,
  getPolicyDetails,
  getPolicyStatusDetails,
} from '@/services';
import { getLoanEligibility, getWithdrawalEligibility } from '@/services/bpm';
import { Fund, getFunds } from '@/services/funds';
import { PolicyRequestInputs } from '@/types/policy';
import { isNullEmptyOrUndefined } from '@/utils/data';
import { pluralize } from '@/utils/strings';

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

  const [
    fundsDataRes,
    withDrawalEligibilityRes,
    loanEligibilityRes,
    policyDetailsRes,
    policyStatusRes,
  ] = await Promise.allSettled([
    getFunds({
      planCode,
      policyNumber,
    }),
    getWithdrawalEligibility({
      planCode,
      policyNumber,
    }),
    getLoanEligibility({
      planCode,
      policyNumber,
    }),
    getPolicyDetails({
      planCode,
      policyNumber,
    }),
    getPolicyStatusDetails({
      planCode,
      policyNumber,
    }),
  ]);

  const summaryData =
    fundsDataRes.status === 'fulfilled'
      ? fundsDataRes.value
      : ({} as ApiResponse<Fund[]>);
  const withdrawalEligibility =
    withDrawalEligibilityRes.status === 'fulfilled'
      ? withDrawalEligibilityRes.value?.data?.isEligible
      : null;
  const loanEligibility =
    loanEligibilityRes.status === 'fulfilled'
      ? loanEligibilityRes.value?.data?.isEligible
      : null;
  const policyDetails =
    policyDetailsRes.status === 'fulfilled'
      ? policyDetailsRes.value?.data
      : null;
  const policyStatusData =
    policyStatusRes?.status === 'fulfilled' ? policyStatusRes.value.data : null;
  const isFreelook =
    policyStatusData?.policyStatus ===
    ('FREELOOK' as PolicyFeature.featureType);

  // UL products do not have the concept of 'electing' funds since there is a single fund option
  const electedFunds =
    policyDetails?.product?.productType === ProductType.UNIVERSALLIFE
      ? summaryData?.data
      : summaryData?.data?.filter(fund => (fund as Fund)?.isElected);

  const accountValueSummary = () => {
    // TODO: not actually sure what the right error handling is here
    // if (error || !data) {
    //   return <NoDataAvailable message={DEFAULT_UNAVAILABLE_STRING} />;
    // }

    return (
      <ClickableCardContainer
        listItems={[
          {
            content: (
              <div className={clsx('stacked-items')}>
                <span className="typography-labels-label-md-alt">Funds</span>
                <span
                  className="typography-content-caption"
                  style={{ color: 'var(--color-base-text-text-secondary)' }}
                >
                  {`${pluralize(electedFunds ? electedFunds.length : 0, 'elected fund')}`}
                </span>
              </div>
            ),
            linkTo: {
              url: `/policies/${planCode}/${policyNumber}/account/funds`,
              label: 'go to funds page',
            },
          },
          {
            content: (
              <div
                className={clsx('stacked-items', {
                  'py-lg': isNullEmptyOrUndefined(withdrawalEligibility),
                })}
              >
                <span className="typography-labels-label-md-alt">
                  Make a withdrawal
                </span>
                <StatusIconText
                  isEligible={withdrawalEligibility}
                  className="typography-content-caption"
                />
              </div>
            ),
            linkTo: {
              url: `/policies/${planCode}/${policyNumber}/account/withdrawals`,
              label: 'go to withdrawals page',
            },
          },
          {
            content: (
              <div
                className={clsx('stacked-items', {
                  'py-lg': isNullEmptyOrUndefined(loanEligibility),
                })}
              >
                <span className="typography-labels-label-md-alt">
                  Take a loan
                </span>
                <StatusIconText
                  isEligible={loanEligibility && !isFreelook}
                  className="typography-content-caption"
                />
              </div>
            ),
            linkTo: {
              url: `/policies/${planCode}/${policyNumber}/account/loans`,
              label: 'go to loans page',
            },
          },
          {
            content: (
              <div className="stacked-items py-lg">
                <span className="typography-labels-label-md-alt">
                  Surrender policy
                </span>
              </div>
            ),
            linkTo: {
              url: `/policies/${planCode}/${policyNumber}/account/surrender`,
              label: 'go to surrender policy page',
            },
          },
        ]}
      >
        <AccountValue
          planCode={planCode}
          policyNumber={policyNumber}
          hideLabel
        />
      </ClickableCardContainer>
    );
  };

  return <div className="container">{accountValueSummary()}</div>;
}
