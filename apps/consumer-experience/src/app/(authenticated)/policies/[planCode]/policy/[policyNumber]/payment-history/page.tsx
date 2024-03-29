import { AccountType, Frequency, Reason } from '@zinnia/api-types/types/sor';

import { CardInsertHistory } from '@/components/card-list-history/CardInsertHistory';
import { CardListHistory } from '@/components/card-list-history/CardListHistory';
import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';
import { toSentenceCase } from '@/utils/strings';

import styles from './PaymentHistory.module.css';

const historyItems = [
  {
    date: '2024-03-12',
    type: Reason.PREMIUM,
    amount: 281.45,
    frequency: Frequency.MONTHLY,
    endDate: '2042-06-11',
    bankDetails: {
      accountType: AccountType.CHECKING,
      accountNumber: '1234',
    },
  },
  {
    date: '2024-03-12',
    type: Reason.PREMIUM,
    amount: 281.45,
    frequency: Frequency.MONTHLY,
    endDate: '2042-06-11',
    bankDetails: {
      accountType: AccountType.CHECKING,
      accountNumber: '1234',
    },
  },
];

export default async function PaymentHistory() {
  const pendingPayments = () => {
    return historyItems.map((item, index) => {
      return (
        <CardInsertHistory
          key={index}
          date={item.date}
          isPending
          amount={item.amount}
          title={`${toSentenceCase(item.type)} payment`}
          subtitle={
            <>
              <span>
                {item.frequency === Frequency.SINGLEPAYMENT
                  ? 'One-time'
                  : 'Autopay'}
              </span>
              <span className="mx-xs" aria-hidden>
                |
              </span>
              <span>{`${toSentenceCase(item.bankDetails.accountType)}
        ending in ${item.bankDetails.accountNumber}`}</span>
            </>
          }
        />
      );
    });
  };

  const completedPayments = () => {
    return historyItems.map((item, index) => {
      return (
        <CardInsertHistory
          key={index}
          date={item.date}
          amount={item.amount}
          title={`${toSentenceCase(item.type)} payment`}
          subtitle={
            <>
              <span>
                {item.frequency === Frequency.SINGLEPAYMENT
                  ? 'One-time'
                  : 'Autopay'}
              </span>
              {item.frequency && item.bankDetails && (
                <span className="mx-xs" aria-hidden>
                  |
                </span>
              )}
              <span>{`${toSentenceCase(item.bankDetails.accountType)}
        ending in ${item.bankDetails.accountNumber}`}</span>
            </>
          }
        />
      );
    });
  };

  return (
    <div>
      <HeaderBreadcrumb title="Payment history" />
      <HeaderPolicyDetails />
      <CardListHistory className="mb-xl">
        <CardListHistory.Header>
          <h2 className={styles.sectionHeader}>Pending</h2>
        </CardListHistory.Header>
        <CardListHistory.ListItems>
          {pendingPayments()}
        </CardListHistory.ListItems>
      </CardListHistory>

      <CardListHistory>
        <CardListHistory.Header>
          <h2 className={styles.sectionHeader}>Completed</h2>
        </CardListHistory.Header>
        <CardListHistory.ListItems>
          {completedPayments()}
        </CardListHistory.ListItems>
      </CardListHistory>
      <Footer />
    </div>
  );
}
