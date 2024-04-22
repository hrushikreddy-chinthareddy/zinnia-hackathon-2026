import clsx from 'clsx';

import { AccountValue } from '@/components/account-value/AccountValue';
import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { StatusIconText } from '@/components/status-icon-text/StatusIconText';
import { getPolicyAccountValueSummary } from '@/services/policy';
import { PolicyRequestInputs } from '@/types/policy';
import { isNullEmptyOrUndefined } from '@/utils/data';
import { DEFAULT_UNAVAILABLE_STRING, pluralize } from '@/utils/strings';

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
                  'py-lg': isNullEmptyOrUndefined(
                    data?.hasWithdrawalEligibility
                  ),
                })}
              >
                <span className="typography-labels-label-md-alt">
                  Make a withdrawal
                </span>
                <StatusIconText
                  isEligible={data?.hasWithdrawalEligibility}
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

  return (
    <div className="container">
      <HeaderBreadcrumb title="Account Value" />
      {accountValueSummary()}
    </div>
  );
}
