import clsx from 'clsx';
import { Metadata } from 'next';

import { AccountValue } from '@/components/account-value/AccountValue';
import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { StatusIconText } from '@/components/status-icon-text/StatusIconText';
import { RouteKey, getPageTitle } from '@/route-map';
import { getPolicyAccountValueSummary } from '@/services/policy';
import { PolicyRequestInputs } from '@/types/policy';
import { isNullEmptyOrUndefined } from '@/utils/data';
import { DEFAULT_UNAVAILABLE_STRING, pluralize } from '@/utils/strings';

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

  // TODO: figure out what should happen on error
  const { data, error } = await getPolicyAccountValueSummary({
    planCode,
    policyNumber,
  });

  const withdrawalsEligibility = data?.hasWithdrawalEligibility;

  const accountValueSummary = () => {
    if (error || !data) {
      return <NoDataAvailable message={DEFAULT_UNAVAILABLE_STRING} />;
    }

    return (
      <ClickableCardContainer
        listItems={[
          {
            content: (
              <div
                className={clsx('stacked-items', {
                  'py-lg': !data?.fundCount,
                })}
              >
                <span className="typography-labels-label-md-alt">Funds</span>
                <span
                  className="typography-content-caption"
                  style={{ color: 'var(--color-base-text-text-secondary)' }}
                >
                  {`${pluralize(data?.fundCount, 'fund')}`}
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
                  'py-lg': isNullEmptyOrUndefined(withdrawalsEligibility),
                })}
              >
                <span className="typography-labels-label-md-alt">
                  Make a withdrawal
                </span>
                <StatusIconText
                  isEligible={withdrawalsEligibility}
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
                  'py-lg': isNullEmptyOrUndefined(data?.hasLoanEligibility),
                })}
              >
                <span className="typography-labels-label-md-alt">
                  Take a loan
                </span>
                <StatusIconText
                  isEligible={data?.hasLoanEligibility}
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
