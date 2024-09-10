import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';

import AssistiveText, { AssistiveTextVariant } from '@deps/components/assistive-text/assistive-text';
import ButtonGrp from '@deps/components/button-group/button-group';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { FormDistribution as FormDistributionData, FundWithdrawnMethod, MoneyType } from '@deps/models/case/withdrawal/case';

import FundAllocations from './fund-allocations';
import MoneyTypeComponent from './money-type';

export interface DistributionInstructionsFormData {
    formData: FormDistributionData;
    fundWithdrawnMethod: FundWithdrawnMethod | null;
}

type FormDistributionProps = {
    isDerivedMethodFromFunds?: boolean;
    defaultMethod?: FundWithdrawnMethod;
    fundWithdrawnMethodOptions?: { label: string; value: FundWithdrawnMethod }[];
    moneyTypeOptions?: { label: string; value: MoneyType }[];
    title?: string;
    isFormStateReadOnly?: boolean;
};
export default function FormDistribution({
    isFormStateReadOnly,
    defaultMethod,
    isDerivedMethodFromFunds,
    fundWithdrawnMethodOptions = [],
    moneyTypeOptions = [],
    title,
}: FormDistributionProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.distributionInstruction' });
    const { formErrors, fundWithdrawnMethod, setFundWithdrawnMethod, formDistribution, setFormDistribution } = useContext(FormDataContext);

    useEffect(() => {
        if (isDerivedMethodFromFunds) {
            const funds = formDistribution?.funds.filter(fund => !!fund.amount.text);
            const method = funds.length > 0 ? FundWithdrawnMethod.SpecifyFunds : defaultMethod ?? '';
            setFundWithdrawnMethod(method);
        }
    }, [defaultMethod]);

    const handleFundWithdrawnMethod = (val: string) => {
        setFundWithdrawnMethod(val);
        if (val !== FundWithdrawnMethod.SpecifyFunds) {
            setFormDistribution(fdd => ({
                ...fdd,
                funds: fdd.funds.map(fund => ({ ...fund, amount: { text: '', amountType: fund.amount.amountType } })),
            }));
        }
    };

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-100">
            <Typography variant={TypographyVariant.H3}>{title || t(`distributionInstruction`)}</Typography>
            {!!moneyTypeOptions.length && (
                <MoneyTypeComponent isFormStateReadOnly={isFormStateReadOnly} moneyTypeOptions={moneyTypeOptions} />
            )}
            {!!fundWithdrawnMethodOptions.length && (
                <div className="mt-4">
                    <ButtonGrp
                        activeValue={fundWithdrawnMethod || ''}
                        groupLabel={t(`fundWithdrawnMethod`)}
                        toggle={handleFundWithdrawnMethod}
                        labels={fundWithdrawnMethodOptions}
                        disabled={isFormStateReadOnly}
                    />
                </div>
            )}
            {fundWithdrawnMethod === FundWithdrawnMethod.SpecifyFunds && (
                <div className="mt-4">
                    <FundAllocations isFormStateReadOnly={isFormStateReadOnly} />
                </div>
            )}

            {formErrors && (
                <div className="mt-4 flex flex-col">
                    {formErrors?.specifyFundsRequired && (
                        <AssistiveText text={formErrors?.specifyFundsRequired} variant={AssistiveTextVariant.Error} className="mt-2" />
                    )}
                </div>
            )}
        </CardContainer>
    );
}
