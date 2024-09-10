import { useTranslation } from 'next-i18next';
import React from 'react';

import FieldData, { FieldDataVariant } from '@deps/components/fields/field-data/field-data';
import PageHeader from '@deps/components/page-header/page-header';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { toSentenceCase } from '@deps/helpers/string.helper';
import useBreadcrumb from '@deps/hooks/useBreadcrumbs';

import { FundsFirstGlanceViewModel } from '../types';

const FundsFirstGlanceCard = ({ accountValue, loanBalance, totalFundValue }: FundsFirstGlanceViewModel) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'funds',
    });
    const { breadcrumb } = useBreadcrumb();
    const headerValues = {
        account: {
            amount: numberFormatify(accountValue),
            label: t('headerValues.account.label'),
            tooltipTitle: toSentenceCase(t('headerValues.account.tooltipTitle') as string),
            tooltipBody: toSentenceCase(t('headerValues.account.tooltipBody') as string),
        },
        fund: {
            amount: numberFormatify(totalFundValue),
            label: t('headerValues.fund.label'),
            tooltipTitle: toSentenceCase(t('headerValues.fund.tooltipTitle') as string),
            tooltipBody: toSentenceCase(t('headerValues.fund.tooltipBody') as string),
            caption: t('headerValues.fund.caption', {
                loanValue: numberFormatify(loanBalance || undefined),
            }),
        },
    };

    return (
        <div id="iodif">
            <PageHeader
                headerText={t('header') || ''}
                breadcrumbText={breadcrumb?.text}
                breadcrumbUrl={breadcrumb?.url}
                belowHeaderTextChildren={
                    <div className="mt-4 flex flex-row gap-8">
                        {Object.entries(headerValues).map(([key, { amount, ...props }]) => (
                            <FieldData key={key} variant={FieldDataVariant.Large} {...props}>
                                {amount}
                            </FieldData>
                        ))}
                    </div>
                }
            />
        </div>
    );
}

export default FundsFirstGlanceCard;
