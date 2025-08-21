import { Label } from '@zinnia/bloom/components';
import { TFunction } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { parseAndFormatDate } from '@deps/helpers/string.helpers';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import { UncashedTransaction } from './uncashed-checks';
import { UncashedFlowBadges } from './uncashed-flowbadges';
import styles from './uncashed-trasaction-card.module.css';

interface UncashedTransactionCardProps {
    t: TFunction;
    transaction: UncashedTransaction;
}

export default function UncashedTransactionCard({
    t,
    transaction,
}: UncashedTransactionCardProps) {
    const isPostDeath = transaction?.postFund === true;

    return (
        <div
            data-testid="uncashed-transaction-card"
            data-transaction-id={transaction.id}
            className="flex w-full flex-col p-5 rounded bg-white border-1 border-gray-200 gap-2 order-2 mb-4"
        >
            <div>
                <Content
                    variant={ContentVariant.BodySm}
                    details={
                        t('transactionListing.cardLabels.check', {
                            number: transaction.checkNumber,
                        }) as string
                    }
                    data-testid={`trans-check-number-${transaction.id}`}
                />
            </div>

            <div className={styles.detailsTable}>
                <div>
                    <Label>{t('transactionListing.cardLabels.amount')}</Label>
                    <Content
                        details={numberFormatify(transaction.transactionAmount)}
                        variant={ContentVariant.BodySm}
                        data-testid={`trans-amount-${transaction.id}`}
                    />
                </div>
                <div>
                    <Label>
                        {t('transactionListing.cardLabels.checkDate')}
                    </Label>
                    <Content
                        details={
                            parseAndFormatDate(
                                ZAHARA_API_DATE_FORMAT,
                                'MMM DD, YYYY',
                                transaction.checkIssueDate
                            ) as string
                        }
                        variant={ContentVariant.BodySm}
                        data-testid={`trans-check-date-${transaction.id}`}
                    />
                </div>
            </div>

            <UncashedFlowBadges
                currentStatus={transaction?.stopTransactionStatus}
                isPostDeath={isPostDeath}
                t={t}
                transactionId={transaction.id}
            />
        </div>
    );
}
