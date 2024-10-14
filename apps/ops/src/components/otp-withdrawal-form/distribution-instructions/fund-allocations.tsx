import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';
import xss from 'xss';

import Field, { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { AmountType } from '@deps/models/case/withdrawal/case';

interface FundAllocationsProps {
    isFormStateReadOnly?: boolean;
}

export default function FundAllocations({ isFormStateReadOnly }: FundAllocationsProps) {
    const { formDistribution, setFormDistribution } = useContext(FormDataContext);
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.distributionInstruction' });
    const [fundAllocations, setFundAllocations] = useState(formDistribution?.funds || []);

    const setFundAllocation = (fundCode: string, amountType: AmountType, val: string) => {
        if (!val) {
            return;
        }
        setFundAllocations(allocations => {
            return allocations.map(allocation => {
                if (allocation.fundCode === fundCode) {
                    return {
                        ...allocation,
                        amount: { text: val, amountType },
                    };
                }
                return allocation;
            });
        });
    };

    useEffect(() => {
        setFormDistribution(oldVal => {
            return { ...oldVal, funds: fundAllocations };
        });
    }, [fundAllocations]);

    return (
        <div className="mt-4">
            <Typography variant={TypographyVariant.H4}>{t(`listOfFunds`)}</Typography>
            {fundAllocations.map((fundAlloc, index) => (
                <div className="mt-4 flex flex-wrap justify-between" key={fundAlloc.fundCode}>
                    <div id={`fund-code-${fundAlloc.fundCode}`} className="flex items-center">
                        <Typography variant={TypographyVariant.LabelMd}>{fundAlloc.fundName}</Typography>
                    </div>
                    <div className="flex gap-4 sm:gap-8">
                        <Field
                            aria-labelledby={`fund-code-${fundAlloc.fundCode}`}
                            onChange={e => {
                                setFundAllocation(fundAlloc.fundCode, AmountType.Dollar, xss(e?.target?.value));
                            }}
                            value={fundAlloc.amount.amountType === AmountType.Dollar ? fundAlloc.amount.text : ''}
                            size={FieldSize.Small}
                            leading={<div>$</div>}
                            type={FieldType.BaseActive}
                            variant={isFormStateReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
                            name={`dollarAmount-${index}`}
                            data-testid={`dollarAmount-${index}`}
                            formatOptions={{
                                format: '',
                                type: 'number',
                                decimalPlaces: 2,
                            }}
                        />
                        <Field
                            aria-labelledby={`fund-code-${fundAlloc.fundCode}`}
                            onChange={e => {
                                setFundAllocation(fundAlloc.fundCode, AmountType.Percent, xss(e?.target?.value));
                            }}
                            value={fundAlloc.amount.amountType === AmountType.Percent ? fundAlloc.amount.text : ''}
                            size={FieldSize.Small}
                            trailing={<div>%</div>}
                            type={FieldType.BaseActive}
                            variant={isFormStateReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
                            name={`percentAmount-${index}`}
                            data-testid={`percentAmount-${index}`}
                            formatOptions={{
                                format: '',
                                type: 'number',
                                decimalPlaces: 2,
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
