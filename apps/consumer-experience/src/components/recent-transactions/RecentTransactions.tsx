import { FC } from 'react';

import { PaymentHistoryTransaction } from '@/types/policy';
import { formatBankAccountTypeText } from '@/utils/data';

import { CardInsertHistory } from '../card-list-history/CardInsertHistory';
import { CardListHistory } from '../card-list-history/CardListHistory';
import { AccountNumber } from '../pii/AccountNumber';
import { AccountType } from '../pii/AccountType';

interface RecentTransactionProps {
  transactions: PaymentHistoryTransaction;
}

//TODO: We arent currently using this, but we will in the future.
export const RecentTransactions: FC<RecentTransactionProps> = ({
  transactions,
}) => {
  return (
    <>
      <h2 className="typography-desktop-headline-2-d">Recent Transactions</h2>
      {transactions.completedTransactions.length > 0 && (
        <CardListHistory>
          <CardListHistory.Header>
            <h2 className="typography-labels-label-sm">Completed</h2>
          </CardListHistory.Header>
          <CardListHistory.ListItems isPending>
            {transactions.completedTransactions.map((item, index) => (
              <CardInsertHistory
                key={'completed-' + index}
                date={item.date}
                amount={item.amount}
                title={item.title}
                subtitle={
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
                }
              />
            ))}
          </CardListHistory.ListItems>
        </CardListHistory>
      )}
      {transactions.pendingTransactions.length > 0 && (
        <CardListHistory>
          <CardListHistory.Header>
            <h2 className="typography-labels-label-sm">Pending</h2>
          </CardListHistory.Header>
          <CardListHistory.ListItems isPending>
            {transactions.pendingTransactions.map((item, index) => (
              <CardInsertHistory
                key={'pending-' + index}
                date={item.date}
                amount={item.amount}
                title={item.title}
                isPending
                subtitle={
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
                }
              />
            ))}
          </CardListHistory.ListItems>
        </CardListHistory>
      )}
    </>
  );
};
