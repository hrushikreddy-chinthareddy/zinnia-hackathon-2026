import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import { TaxWithholding } from '@deps/models/case/withdrawal/case';

import Field, { FieldFormat, FieldSize, FieldType, FieldVariant } from '../fields/field';

export enum MaritalStatusAllowances {
    Single = 'Single',
    Married = 'Married',
    HeadOfHousehold = 'Head of Household',
}

export interface Allowance<T> {
    text: T;
}

const defaultMaritalStatusAllowancesItems = [
    { label: 'maritalStatusAllowanceItems.single', value: MaritalStatusAllowances.Single },
    { label: 'maritalStatusAllowanceItems.married', value: MaritalStatusAllowances.Married },
    { label: 'maritalStatusAllowanceItems.headOfHousehold', value: MaritalStatusAllowances.HeadOfHousehold },
];

function toggleAllowances<T>(val: T, setAllowances: React.Dispatch<React.SetStateAction<Allowance<T>[]>>) {
    return (shouldHaveAllowance: boolean) => {
        setAllowances(allowances => {
            const hasAllowance = allowances.find(checkedAllowance => checkedAllowance.text === val);
            if (hasAllowance && !shouldHaveAllowance) {
                return allowances.filter(checkedAllowance => checkedAllowance.text !== val);
            }

            if (!hasAllowance && shouldHaveAllowance) {
                const newAllowance = {
                    text: val,
                };
                return [...allowances, newAllowance];
            }

            return allowances;
        });
    };
}

interface MartialStatusAllowancesWithholdingsProps {
    maritalAllowances: Pick<TaxWithholding, 'multipleAllowances' | 'exemption' | 'allowances'>;
    setMaritalAllowances: (val: Pick<TaxWithholding, 'multipleAllowances' | 'exemption' | 'allowances'>) => void;
    isFormStateReadOnly?: boolean;
    meritalStatusAllowanceConfig?: { label: string; maritalStatusAllowancesOptions: { label: string; value: MaritalStatusAllowances }[] };
}

export default function MartialStatusAllowancesWithholdings(props: MartialStatusAllowancesWithholdingsProps) {
    const { maritalAllowances, isFormStateReadOnly, setMaritalAllowances, meritalStatusAllowanceConfig } = props;
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.taxWithholdings' });

    function isChecked<T>(val: T, allowances: Allowance<T>[]): boolean {
        return !!allowances?.find(allowance => allowance.text === val);
    }

    const maritalStatusAllowancesItems =
        (meritalStatusAllowanceConfig && meritalStatusAllowanceConfig?.maritalStatusAllowancesOptions) ??
        defaultMaritalStatusAllowancesItems;

    const [isMultipleAllowances, setMultipleAllowances] = useState<boolean>(maritalAllowances?.multipleAllowances?.text || false);
    const [maritalStatus, setMaritalStatus] = useState(maritalAllowances?.allowances ?? []);
    const [noOfAllowance, setNoOfAllowance] = useState(maritalAllowances?.exemption?.text || '0');
    const numberFormat = { type: 'number' as FieldFormat, decimalPlaces: 0, format: '' };

    useEffect(() => {
        const allowances = {
            allowances: maritalStatus,
            exemption: { text: noOfAllowance },
            multipleAllowances: { text: isMultipleAllowances },
        };
        setMaritalAllowances(isMultipleAllowances ? allowances : {});
    }, [isMultipleAllowances, maritalStatus, noOfAllowance]);

    return (
        <div className="my-4 w-full border-t-2 border-gray-100 p-2">
            <div className="my-4 flex flex-wrap gap-8 max-md:flex-col">
                <div className="flex-1" key="marital-status-allowances">
                    <CheckboxText
                        label={t(meritalStatusAllowanceConfig?.label ?? `maritalStatusAllowances`)}
                        checked={isMultipleAllowances}
                        onChange={() => setMultipleAllowances(!isMultipleAllowances)}
                        data-testid="marital-status-allowances-test-id"
                        isDisabled={isFormStateReadOnly}
                    />
                </div>
            </div>

            {isMultipleAllowances && (
                <>
                    <div className="my-4 grid grid-cols-1 gap-4">
                        {maritalStatusAllowancesItems.map(({ label, value }) => {
                            return (
                                <div key={`marital-status-${value}`}>
                                    <CheckboxText
                                        checked={isChecked(value, maritalStatus)}
                                        data-testid={`marital-status-test-id-${value}`}
                                        label={t(label)}
                                        onChange={toggleAllowances(value, setMaritalStatus)}
                                        isDisabled={isFormStateReadOnly}
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <Field
                            formatOptions={numberFormat}
                            label={t(`noOfAllowance`) as string}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={noOfAllowance}
                            onChange={e => setNoOfAllowance(e?.target?.value)}
                            variant={isFormStateReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
                            data-testid="no-of-allowances-test-id"
                            disabled={isFormStateReadOnly}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
