import { useTranslation } from 'next-i18next';
import React, { useCallback, useEffect } from 'react';

import FieldData, { FieldDataVariant } from '@deps/components/fields/field-data/field-data';
import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import PageHeader from '@deps/components/page-header/page-header';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { BasePolicyComponentArgs } from '@deps/helpers/policy-sor/PolicyDetails';
import { isNullEmptyOrUndefined, toSentenceCase } from '@deps/helpers/string.helper';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import { checkEligibilityFundTransfer } from '@deps/queries/api/fund-transfer';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

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

    const { featureFlags } = useOptimizely();

    const [fundTransferEligibility, setFundTransferEligibility] = React.useState(false);

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

    const planCode = policy?.product?.planCode;
    const policyNumber = policy?.policyNumber;

    const checkFundTransferEligibility = useCallback(async () => {
        const fundTransferStatus = await checkEligibilityFundTransfer(planCode, policyNumber);
        if (fundTransferStatus?.status === TransactionResponseStatus.Success) {
            setFundTransferEligibility(true);
        }
    }, [planCode, policyNumber]);

    useEffect(() => {
        checkFundTransferEligibility();
    }, [checkFundTransferEligibility]);

    return (
        <div id="iodif">
            <PageHeader
                headerText={t('header') || ''}
                belowHeaderTextChildren={
                    <>
                        <div className="mt-4 flex flex-row gap-8">
                            {Object.entries(headerValues).map(([key, { amount, ...props }]) => (
                                <FieldData key={key} variant={FieldDataVariant.Large} {...props}>
                                    {amount}
                                </FieldData>
                            ))}
                        </div>
                        {featureFlags[FEATURE_FLAGS.FUNDS_TRANSFER_TRANSACTION] && (
                            <div className="mt-4 flex w-full flex-row items-center gap-8 bg-gray-50 px-8 py-4 align-middle">
                                <NavElement
                                    disabled={fundTransferEligibility === false}
                                    href={`/policies/${planCode}/${policyNumber}/policy/funds/new-fund-transfer`}
                                    size={NavElementSize.Small}
                                    type={NavElementType.Link}
                                    data-testid="funds-start-link"
                                >
                                    {t('transferFund')}
                                </NavElement>
                            </div>
                        )}
                    </>
                }
            />
        </div>
    );
};

export default FundsFirstGlanceCard;
