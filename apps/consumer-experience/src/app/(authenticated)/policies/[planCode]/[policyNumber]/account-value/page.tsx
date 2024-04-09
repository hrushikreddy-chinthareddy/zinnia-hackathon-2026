import { Icon, IconType, Popover } from '@zinnia/bloom/internal/components';
import { toSentenceCase } from '@zinnia/utils';

import { CardInsertHistory } from '@/components/card-list-history/CardInsertHistory';
import { CardListHistory } from '@/components/card-list-history/CardListHistory';
import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';
import { AccountValue } from '@/components/policy-overview/AccountValue';
import { StatusIconText } from '@/components/status-icon-text/StatusIconText';
import { getPolicyAccountValueSummary } from '@/services/policy';
import { PolicyRequestInputs } from '@/types/policy';
import { pluralize } from '@/utils/strings';

const historyItems = [
  {
    date: '2024-11-02',
    title: 'Monthly interest',
    amount: 440.65,
  },
  {
    date: '2024-03-06',
    title: 'everly match',
    amount: 2.01,
    type: 'match',
  },
];

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

  const allHistoryItems = () => {
    return historyItems.map((item, index) => {
      const displayTitle = (
        <div style={{ display: 'flex' }}>
          <p className="mr-xs">{toSentenceCase(item.title)}</p>
          {item.type === 'match' && (
            <Popover
              title="Everly Match"
              trigger={
                <Icon
                  type={IconType.CIRCLE_INFO}
                  height={16}
                  width={16}
                  color="var(--color-base-icon-icon-tooltip, #ff7500)"
                />
              }
            >
              <p className="typography-content-body">
                When you pay a premium of more than $250 and your policy is in
                the vesting period, Everly will match 1% of your premium
                payment. We credit this directly to your account value.
              </p>
            </Popover>
          )}
        </div>
      );

      return (
        <CardInsertHistory
          key={`${item.title}-${index}`}
          date={item.date}
          title={displayTitle}
          amount={item.amount}
        />
      );
    });
  };

  return (
    <div className="container">
      <HeaderBreadcrumb title="Account Value" />
      <HeaderPolicyDetails planCode={planCode} policyNumber={policyNumber} />
      <ClickableCardContainer
        listItems={[
          {
            content: (
              <div className="stacked-items">
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
              url: `/policies/${planCode}/${policyNumber}/account-value/funds`,
              label: 'go to funds page',
            },
          },
          {
            content: (
              <div className="stacked-items">
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
              url: `/policies/${planCode}/${policyNumber}/account-value/withdrawals`,
              label: 'go to withdrawals page',
            },
          },
          {
            content: (
              <div className="stacked-items">
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
              url: `/policies/${planCode}/${policyNumber}/account-value/loans`,
              label: 'go to loans page',
            },
          },
          {
            content: (
              <div className="stacked-items">
                <span className="typography-labels-label-md-alt py-lg">
                  Surrender policy
                </span>
              </div>
            ),
            linkTo: {
              url: `/policies/${planCode}/${policyNumber}/account-value/surrender-policy`,
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
      <CardListHistory>
        <CardListHistory.Header>
          <h2>History</h2>
        </CardListHistory.Header>
        <CardListHistory.ListItems>
          {allHistoryItems()}
        </CardListHistory.ListItems>
      </CardListHistory>
      <Footer />
    </div>
  );
}
