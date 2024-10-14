import { useTranslation } from 'next-i18next';
import React from 'react';

import FieldData, { FieldDataVariant } from '@deps/components/fields/field-data/field-data';
import PageHeader from '@deps/components/page-header/page-header';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { BasePolicyComponentArgs } from '@deps/helpers/policy-sor/PolicyDetails';
import { isNullEmptyOrUndefined, toSentenceCase } from '@deps/helpers/string.helper';
import useBreadcrumb from '@deps/hooks/useBreadcrumbs';

interface AccountDisplayOptions {
    amount: string;
    label: string;
    tooltipTitle: string;
    tooltipBody: string;
    caption?: string | null;
}

interface HeaderValueProps {
    account: AccountDisplayOptions;
}

const FundsFirstGlanceCard = ({ policy }: BasePolicyComponentArgs) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'funds',
    });
    const { breadcrumb } = useBreadcrumb();
    const accountValue = policy.accountValue;
    const headerValues: HeaderValueProps = {
        account: {
            amount: numberFormatify(accountValue),
            label: t('headerValues.account.label'),
            tooltipTitle: toSentenceCase(t('headerValues.account.tooltipTitle') as string),
            tooltipBody: toSentenceCase(t('headerValues.account.tooltipBody') as string),
        },
    };

    if (policy?.hasLoans) {
        const loanBalance = policy?.policy?.loanValues?.totalLoanBalance;
        // per requirements in DEPU-2576 if the value is null or undefined it should display 0
        const loanValue = isNullEmptyOrUndefined(loanBalance) ? 0 : loanBalance;
        const fractionDigits = !loanValue ? 0 : 2;
        const currencyFormat: Intl.NumberFormatOptions = {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits,
        };
        headerValues.account.caption = t('headerValues.fund.caption', {
            loanValue: numberFormatify(loanValue, currencyFormat),
        });
    }

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
};

export default FundsFirstGlanceCard;
