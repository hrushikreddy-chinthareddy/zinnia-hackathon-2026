import { Metadata } from 'next';

import { RouteKey, getPageTitle } from '@/route-map';
import { PolicyRequestInputs } from '@/types/policy';

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
  return null;
  // const { data, error } = await getPaymentHistory(params);

  // if (
  //   error ||
  //   (data?.completedTransactions.length === 0 &&
  //     data?.pendingTransactions.length === 0)
  // ) {
  //   return (
  //     <div className="space-mb-gap-lg">
  //       <MockMessage />
  //       <NoDataAvailable
  //         iconType={IconType.PAYMENT}
  //         message="No payment history available"
  //       />
  //     </div>
  //   );
  // }

  // const { completedTransactions, pendingTransactions } = data!;

  // const sortedPendingTransactions = pendingTransactions.sort((a, b) =>
  //   sortByDate(a.date, b.date, { order: 'asc' })
  // );

  // const pendingPayments = () => {
  //   return sortedPendingTransactions?.map((item, index) => {
  //     return (
  //       <CardInsertHistory
  //         isPending
  //         key={index}
  //         date={item.date}
  //         amount={item.amount}
  //         title={item.title}
  //         subtitle={
  //           <>
  //             <span>{item.frequency && toSentenceCase(item.frequency)}</span>
  //             {item.frequency && item.bankDetails && (
  //               <span className="mx-xs" aria-hidden>
  //                 |
  //               </span>
  //             )}
  //             <span>
  //               <AccountType
  //                 accountType={formatBankAccountTypeText(
  //                   item?.bankDetails?.accountType
  //                 )}
  //               />
  //               {' ending in '}
  //               <AccountNumber
  //                 accountNumber={item?.bankDetails?.accountNumber}
  //               />
  //             </span>
  //           </>
  //         }
  //       />
  //     );
  //   });
  // };
  // const completedPayments = () => {
  //   return completedTransactions.map((item, index) => {
  //     return (
  //       <CardInsertHistory
  //         key={index}
  //         date={item.date}
  //         amount={item.amount}
  //         title={item.title}
  //         subtitle={
  //           <>
  //             <span>{item.frequency && toSentenceCase(item.frequency)}</span>
  //             {item.frequency && item.bankDetails && (
  //               <span className="mx-xs" aria-hidden>
  //                 |
  //               </span>
  //             )}

  //             <span>
  //               <AccountType
  //                 accountType={formatBankAccountTypeText(
  //                   item?.bankDetails?.accountType
  //                 )}
  //               />
  //               {' ending in '}
  //               <AccountNumber
  //                 accountNumber={item?.bankDetails?.accountNumber}
  //               />
  //             </span>
  //           </>
  //         }
  //       />
  //     );
  //   });
  // };

  // return (
  //   <div className="container">
  //     <CallForAssistance customInstruction="for questions about a payment." />

  //     {pendingTransactions.length > 0 && (
  //       <CardListHistory>
  //         <CardListHistory.Header>
  //           <h2 className="typography-labels-label-sm">Pending</h2>
  //         </CardListHistory.Header>
  //         <CardListHistory.ListItems isPending>
  //           {pendingPayments()}
  //         </CardListHistory.ListItems>
  //       </CardListHistory>
  //     )}

  //     {completedTransactions.length > 0 && (
  //       <CardListHistory>
  //         <CardListHistory.Header>
  //           <h2 className="typography-labels-label-sm">Completed</h2>
  //         </CardListHistory.Header>
  //         <CardListHistory.ListItems>
  //           {completedPayments()}
  //         </CardListHistory.ListItems>
  //       </CardListHistory>
  //     )}
  //   </div>
  // );
}
