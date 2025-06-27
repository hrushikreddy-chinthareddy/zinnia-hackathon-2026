import { useQuery } from '@tanstack/react-query';
import { Icon, IconType } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { getTransactionEntityQuery } from '@deps/queries/tanstack/transactions/transactionsQueries';
import { ReactComponent as InProgressIcon } from '@deps/styles/elements/icons/alert/in-progress.svg';

import { ViewTransactionsProps } from './transactions-step-additional-data.types';
import TransactionsTable from './transactions-table';

export function ViewTransactions({
    stepAdditionalData,
    prop,
}: ViewTransactionsProps) {
    const { t } = useTranslation();
    const entityId = stepAdditionalData.value;
    const {
        data: transactionEntity,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['claimsTransactions', entityId],
        queryFn: () => getTransactionEntityQuery(entityId),
    });
    const programs = transactionEntity
        ? transactionEntity?.entity?.stopPrograms?.[prop]
        : [];

    const displayNoTransactions = () => {
        return (
            <div className="my-3 flex w-[436px] justify-between rounded border border-gray-100 p-[12px]">
                <div className="text-sm font-bold">
                    <AssistiveText
                        text={t('transactionListing.noTransactionsFoundTitle')}
                        variant={AssistiveTextVariant.Default}
                        iconOverride={
                            <Icon
                                width={16}
                                height={16}
                                type={IconType.DOCUMENT_TEXT}
                            />
                        }
                    />
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex w-full flex-col">
                <div className="mt-0.5">
                    <InProgressIcon
                        height={18}
                        width={18}
                        role="presentation"
                        className="shrink-0 text-gray-600 transform-origin-center duration-5000 animate-spin ease-linear"
                        aria-hidden={true}
                    />
                </div>
                <div>
                    <Typography
                        variant={TypographyVariant.BodySmBold}
                        className={'text-gray-600'}
                    >
                        {t('transactionListing.loadingTransactions')}
                    </Typography>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex w-full flex-col">
                <div className="mt-0.5">
                    <InProgressIcon
                        height={18}
                        width={18}
                        role="presentation"
                        aria-hidden={true}
                        className="shrink-0 text-gray-600"
                    />
                </div>
                <div>
                    <Typography
                        variant={TypographyVariant.BodySmBold}
                        className={'text-gray-600'}
                    >
                        {t('transactionListing.errorGettingTransactions')}
                    </Typography>
                </div>
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col">
            <div>
                <Typography variant={TypographyVariant.H3} className="mb-4">
                    {t('transactionListing.stoppedTransactions')}
                </Typography>
            </div>
            {programs && programs?.length > 0 ? (
                <TransactionsTable transactions={programs} t={t} />
            ) : (
                displayNoTransactions()
            )}
        </div>
    );
}
