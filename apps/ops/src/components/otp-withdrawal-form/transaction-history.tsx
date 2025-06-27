import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import React from 'react';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { Transaction } from '@deps/models/case/withdrawal/case';
import {
    DEFAULT_DATE_FORMAT,
    ZAHARA_API_DATE_FORMAT,
} from '@deps/types/constants';
interface TransactionHistoryProps {
    transactions: Transaction[];
}

const TransactionHistoryComponent = ({
    transactions,
}: TransactionHistoryProps) => {
    const { t } = useTranslation();
    const BASE_TRANSLATION_KEY = 'caseWithdrawal.sidebar.transaction.';
    const currency = '$';
    return (
        <>
            <Typography
                variant={TypographyVariant.BodyBold}
                className="my-2 border-b-1"
            >
                {t(`${BASE_TRANSLATION_KEY}title`)}
            </Typography>
            <div className="grid grid-cols-3 gap-1 font-bold">
                <div>
                    <Typography variant={TypographyVariant.Label}>
                        {t(`${BASE_TRANSLATION_KEY}date`)}
                    </Typography>
                </div>
                <div>
                    <Typography variant={TypographyVariant.Label}>
                        {t(`${BASE_TRANSLATION_KEY}amount`)}
                    </Typography>
                </div>
                <div>
                    <Typography variant={TypographyVariant.Label}>
                        {t(`${BASE_TRANSLATION_KEY}status`)}
                    </Typography>
                </div>
            </div>
            {transactions.map((item, i) => {
                return (
                    <div className="grid grid-cols-3 gap-1 " key={i}>
                        <div>
                            <Typography variant={TypographyVariant.Label}>
                                {item.TransactionDate &&
                                    dayjs(
                                        item.TransactionDate,
                                        ZAHARA_API_DATE_FORMAT
                                    ).format(DEFAULT_DATE_FORMAT)}
                            </Typography>
                        </div>
                        <div>
                            <Typography variant={TypographyVariant.Label}>
                                {currency}
                                {item.TransactionAmount}
                            </Typography>
                        </div>
                        <div>
                            <Typography variant={TypographyVariant.Label}>
                                {item.Status}
                            </Typography>
                        </div>
                    </div>
                );
            })}
        </>
    );
};

export default TransactionHistoryComponent;
