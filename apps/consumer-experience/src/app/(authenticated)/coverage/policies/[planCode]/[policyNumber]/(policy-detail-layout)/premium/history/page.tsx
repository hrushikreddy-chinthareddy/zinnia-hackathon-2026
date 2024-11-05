import { IconType } from '@zinnia/bloom/components';
import { Metadata } from 'next';

import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { CardInsertHistory } from '@/components/card-list-history/CardInsertHistory';
import { CardListHistory } from '@/components/card-list-history/CardListHistory';
import MockMessage from '@/components/MockMessage';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { AccountNumber } from '@/components/pii/AccountNumber';
import { AccountType } from '@/components/pii/AccountType';
import { RouteKey, getPageTitle } from '@/route-map';
import { getPaymentHistory } from '@/services';
import { PolicyRequestInputs } from '@/types/policy';
import { formatBankAccountTypeText } from '@/utils/data';
import { sortByDate } from '@/utils/dates';
import { toSentenceCase } from '@/utils/strings';

const pageTitle = getPageTitle(RouteKey.PREMIUM_HISTORY);
// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

interface Props {
  params: PolicyRequestInputs;
}

export default async function PaymentHistory({ params }: Props) {
  const { data, error } = await getPaymentHistory(params);

  if (
    error ||
    (data?.completedTransactions.length === 0 &&
      data?.pendingTransactions.length === 0)
  ) {
    return (
      <div className="space-mb-gap-lg">
        <MockMessage />
        <NoDataAvailable
          iconType={IconType.PAYMENT}
          message="No payment history available"
        />
      </div>
    );
  }

  const { completedTransactions, pendingTransactions, carrierId } = data!;

  const sortedPendingTransactions = pendingTransactions.sort((a, b) =>
    sortByDate(a.date, b.date, { order: 'asc' })
  );

  const pendingPayments = () => {
    return sortedPendingTransactions?.map((item, index) => {
      return (
        <CardInsertHistory
          isPending
          key={index}
          date={item.date}
          amount={item.amount}
          title={item.title}
          subtitle={
            <>
              <span>{item.frequency && toSentenceCase(item.frequency)}</span>
              {item.frequency && item.bankDetails && (
                <span className="mx-xs" aria-hidden>
                  |
                </span>
              )}
              <span>
                <AccountType
                  accountType={formatBankAccountTypeText(
                    item?.bankDetails?.accountType
                  )}
                />
                {' ending in '}
                <AccountNumber
                  accountNumber={item?.bankDetails?.accountNumber}
                />
              </span>
            </>
          }
        />
      );
    });
  };
  const completedPayments = () => {
    return completedTransactions.map((item, index) => {
      return (
        <CardInsertHistory
          key={index}
          date={item.date}
          amount={item.amount}
          title={item.title}
          subtitle={
            <>
              <span>{item.frequency && toSentenceCase(item.frequency)}</span>
              {item.frequency && item.bankDetails && (
                <span className="mx-xs" aria-hidden>
                  |
                </span>
              )}

              <span>
                <AccountType
                  accountType={formatBankAccountTypeText(
                    item?.bankDetails?.accountType
                  )}
                />
                {' ending in '}
                <AccountNumber
                  accountNumber={item?.bankDetails?.accountNumber}
                />
              </span>
            </>
          }
        />
      );
    });
  };

  return (
    <div className="container">
      <CallForAssistance
        customInstruction="for questions about a payment."
        carrierId={carrierId}
      />

      {pendingTransactions.length > 0 && (
        <CardListHistory>
          <CardListHistory.Header>
            <h2 className="typography-labels-label-sm">Pending</h2>
          </CardListHistory.Header>
          <CardListHistory.ListItems isPending>
            {pendingPayments()}
          </CardListHistory.ListItems>
        </CardListHistory>
      )}

      {completedTransactions.length > 0 && (
        <CardListHistory>
          <CardListHistory.Header>
            <h2 className="typography-labels-label-sm">Completed</h2>
          </CardListHistory.Header>
          <CardListHistory.ListItems>
            {completedPayments()}
          </CardListHistory.ListItems>
        </CardListHistory>
      )}
    </div>
  );
}
