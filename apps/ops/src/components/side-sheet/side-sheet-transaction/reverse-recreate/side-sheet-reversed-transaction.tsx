import { TransactionType } from '@zinnia/api-types/types/sor';
import {
    Loader,
    LoaderVariant,
    Tag,
    TagVariant,
} from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import { Content, ContentVariant } from '@deps/components/content/content';
import { numberFormatify } from '@deps/helpers/numbers.helpers';

import SideSheetReversedTransactionContent from './side-sheet-reversed-transaction-content';
import { SideSheetTransactionProps } from '../types';
import { getReverseRecreateTransactionSideSheetValues } from './side-sheet-reverse-recreate.helpers';
import { ReverseTransactionSidesheetValues } from './types';

export const SideSheetReversedTransaction = ({
    policy,
    transaction,
}: SideSheetTransactionProps) => {
    const { t } = useTranslation(undefined);

    const [sidesheetValues, setSidesheetValues] =
        useState<ReverseTransactionSidesheetValues>(
            getReverseRecreateTransactionSideSheetValues(policy, transaction, t)
        );
    const { getAsyncSideSheetValues } = sidesheetValues;
    const [loading, setLoading] = useState(false);
    const [asyncValues, setAsyncValues] = useState<any | null>(null);

    const { transactionType } = transaction || {};

    useEffect(() => {
        const getValues = async () => {
            setLoading(true);

            const asyncValues = getAsyncSideSheetValues
                ? await getAsyncSideSheetValues()
                : {};
            setAsyncValues(asyncValues);
            setSidesheetValues((vals: ReverseTransactionSidesheetValues) => {
                return { ...vals, ...asyncValues };
            });
            setLoading(false);
        };

        !loading && !asyncValues && getAsyncSideSheetValues && getValues();
    }, [
        getAsyncSideSheetValues,
        asyncValues,
        setAsyncValues,
        loading,
        setLoading,
        setSidesheetValues,
    ]);

    const SidesheetContent = SideSheetReversedTransactionContent({
        t,
        loading,
        values: sidesheetValues,
    });

    return (
        <div className="p-8">
            <div className={`flex flex-col gap-4`}>
                <div className="flex flex-col gap-4">
                    {loading ? (
                        <Loader variant={LoaderVariant.CTA} />
                    ) : (
                        <Tag
                            variant={TagVariant.Default}
                            text={
                                t('status.reversedOn', {
                                    date: sidesheetValues?.reversalDate,
                                }) as string
                            }
                        ></Tag>
                    )}
                    {transactionType !== TransactionType.FULL_SURRENDER &&
                        transactionType !==
                            TransactionType.PARTIAL_WITHDRAWAL_ONE_TIME &&
                        transactionType !==
                            TransactionType.FREE_LOOK_CANCELLATION && (
                            <div>
                                <Content
                                    details={numberFormatify(
                                        sidesheetValues?.transactionValue
                                    )}
                                    variant={ContentVariant.Value}
                                />
                                <Content
                                    className="text-gray-600"
                                    details={
                                        t(
                                            'policy.history.sidesheet.effective',
                                            {
                                                date: sidesheetValues?.effectiveDate,
                                            }
                                        ) as string
                                    }
                                    variant={ContentVariant.Caption}
                                />
                            </div>
                        )}
                </div>
            </div>
            {SidesheetContent}
        </div>
    );
};

export default SideSheetReversedTransaction;
