import { useQuery } from '@tanstack/react-query';
import { Button, Icon, IconType } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { getTransactionEntityQuery } from '@deps/queries/tanstack/transactions/transactionsQueries';
import { ReactComponent as InProgressIcon } from '@deps/styles/elements/icons/alert/in-progress.svg';

import {
    StepProgramTypes,
    ViewTransactionsProps,
} from './transactions-step-additional-data.types';
import TransactionsTable from './transactions-table';
import UncashedTransactionsTable from './uncashed-transactions-table';

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
        refetch,
    } = useQuery({
        queryKey: ['claimsTransactions', entityId],
        queryFn: () => getTransactionEntityQuery(entityId),
    });

    const programs =
        prop === StepProgramTypes.UNCASHED
            ? transactionEntity?.entity?.stopTransactions?.transactions ?? []
            : transactionEntity?.entity?.stopPrograms?.[prop] ?? [];

    const refreshData = () => {
        refetch();
    };

    const displayNoTransactions = () => {
        return (
            <div className="my-3 flex w-[436px] justify-between rounded border border-gray-100 p-[12px]">
                <div className="text-sm font-bold">
                    <AssistiveText
                        text={
                            prop === StepProgramTypes.UNCASHED
                                ? t('transactionListing.noUncashedTransactions')
                                : t(
                                      'transactionListing.noTransactionsFoundTitle'
                                  )
                        }
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
                {prop === StepProgramTypes.UNCASHED ? (
                    <div className="flex flex-row items-center gap-2 mb-4">
                        <Typography variant={TypographyVariant.H4}>
                            {t('transactionListing.uncashedTransactions')}
                        </Typography>
                        <Button onClick={refreshData} mode="link" size="small">
                            <Icon
                                width={16}
                                height={16}
                                type={IconType.REFRESH}
                            />
                        </Button>
                    </div>
                ) : (
                    <Typography variant={TypographyVariant.H3} className="mb-4">
                        {t('transactionListing.stoppedTransactions')}
                    </Typography>
                )}
            </div>
            {programs.length > 0 ? (
                prop === StepProgramTypes.UNCASHED ? (
                    <>
                        <UncashedTransactionsTable
                            transactions={programs}
                            t={t}
                        />
                    </>
                ) : (
                    <TransactionsTable transactions={programs} t={t} />
                )
            ) : (
                displayNoTransactions()
            )}
        </div>
    );
}
