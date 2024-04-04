import { IconType } from '@zinnia/bloom/internal/components';

import { CardInsertHistory } from '@/components/card-list-history/CardInsertHistory';
import { CardListHistory } from '@/components/card-list-history/CardListHistory';
import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';
import MockMessage from '@/components/MockMessage';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { getPaymentHistory } from '@/services';
import { PolicyRequestInputs } from '@/types/policy';
import { formatBankAccountTypeText, getFrequency } from '@/utils/data';

import styles from './PaymentHistory.module.css';

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
          message="There is currently no payments history data available."
        />
      </div>
    );
  }

  const { completedTransactions, pendingTransactions } = data!;

  const pendingPayments = () => {
    return pendingTransactions.map((item, index) => {
      return (
        <CardInsertHistory
          isPending
          key={index}
          date={item.date}
          amount={item.amount}
          title={item.title}
          subtitle={
            <>
              <span>{getFrequency(item.frequency)}</span>
              {item.frequency && item.bankDetails && (
                <span className="mx-xs" aria-hidden>
                  |
                </span>
              )}
              <span>{`${formatBankAccountTypeText(item?.bankDetails?.accountType)}
        ending in ${item.bankDetails?.accountNumber}`}</span>
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
              <span>{getFrequency(item.frequency)}</span>
              {item.frequency && item.bankDetails && (
                <span className="mx-xs" aria-hidden>
                  |
                </span>
              )}
              <span>{`${formatBankAccountTypeText(item?.bankDetails?.accountType)}
        ending in ${item.bankDetails?.accountNumber}`}</span>
            </>
          }
        />
      );
    });
  };

  return (
    <div className="container">
      <HeaderBreadcrumb title="Payment history" />
      <HeaderPolicyDetails
        planCode={params.planCode}
        policyNumber={params.policyNumber}
      />
      {pendingTransactions.length > 0 && (
        <CardListHistory>
          <CardListHistory.Header>
            <h2 className={styles.sectionHeader}>Pending</h2>
          </CardListHistory.Header>
          <CardListHistory.ListItems isPending>
            {pendingPayments()}
          </CardListHistory.ListItems>
        </CardListHistory>
      )}

      {completedTransactions.length > 0 && (
        <CardListHistory>
          <CardListHistory.Header>
            <h2 className={styles.sectionHeader}>Completed</h2>
          </CardListHistory.Header>
          <CardListHistory.ListItems>
            {completedPayments()}
          </CardListHistory.ListItems>
        </CardListHistory>
      )}
      <Footer />
    </div>
  );
}
