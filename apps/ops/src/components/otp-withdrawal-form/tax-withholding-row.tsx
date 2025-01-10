import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import xss from 'xss';

import ButtonGroupItem from '@deps/components/button-group/button-group-item/button-group-item';
import Field, { FieldFormat, FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import FieldLabel from '@deps/components/fields/field-label';
import { TaxWithholdingPlace } from '@deps/models/case/withdrawal/case';

import { AdditionalWithHoldingConfig } from './tax-withholdings';

export interface WithholdingView {
    dollarAmount: string | null;
    dontWithhold: boolean;
    percentAmount: string | null;
    additionalPercentAmount: string | null;
    place: TaxWithholdingPlace;
    selectMinimum: boolean;
    specified?: boolean;
}

export interface TaxWithholdingRowProp {
    className?: string | '';
    label: string;
    onDataChange: (value: WithholdingView) => void;
    place: TaxWithholdingPlace;
    withholding: WithholdingView | undefined;
    additionalWithHoldingConfig?: AdditionalWithHoldingConfig;
    isFormStateReadOnly?: boolean;
    selectMin?: boolean | true;
}

export const getClasses = (checked: boolean) => {
    const baseClasses = clsx(
        `relative box-border inline-flex h-[42px] flex-col items-center justify-center whitespace-nowrap rounded-md font-secondary text-md leading-5.5 outline-none after:invisible after:relative after:mt-[-22px] after:font-bold after:content-[attr(data-label)] focus:outline-none focus-visible:before:absolute focus-visible:before:inset-[-3px] focus-visible:before:z-20 focus-visible:before:-m-2 focus-visible:before:rounded focus-visible:before:border-2 focus-visible:before:border-semantic-focus`
    );

    const checkedClasses = clsx({
        'z-19 border-primary !bg-primary-lighter font-bold hover:!bg-primary-lighter': checked,
        'border-2 bg-white font-normal': !checked,
    });

    return clsx(baseClasses, checkedClasses);
};

const TaxWithholdingRow: React.FC<TaxWithholdingRowProp> = ({
    className,
    label,
    onDataChange,
    place,
    withholding,
    additionalWithHoldingConfig = null,
    isFormStateReadOnly,
    selectMin = true
}) => {
    const { t } = useTranslation();
    const [dollarAmount, setDollarAmount] = useState<string | null>(withholding?.dollarAmount || null);
    const [dontWithhold, setDontWithhold] = useState<boolean>(withholding?.dontWithhold || false);
    const [percentAmount, setPercentAmount] = useState<string | null>(withholding?.percentAmount || null);
    const [additionalPercentAmount, setAdditionalPercentAmount] = useState<string | null>(withholding?.additionalPercentAmount || null);
    const [selectMinimum, setSelectMinimum] = useState<boolean>(withholding?.selectMinimum || false);
    const numberFormat = { type: 'number' as FieldFormat, decimalPlaces: 2, format: '' };

    useEffect(() => {
        onDataChange({
            dollarAmount,
            dontWithhold,
            percentAmount,
            place,
            selectMinimum,
            additionalPercentAmount,
        });
    }, [dollarAmount, dontWithhold, percentAmount, selectMinimum, additionalPercentAmount]);

    return (
        <div className={className} data-testid={`${place}-tax-withholding-row`}>
            <FieldLabel label={label} />
            <div className="grid w-full grid-cols-3 grid-rows-2 gap-2 md:grid-cols-5 md:grid-rows-1">
                <ButtonGroupItem
                    className={getClasses(dontWithhold)}
                    checked={dontWithhold}
                    dataTestId={`${place}-tax-withholding-do-not-withhold`}
                    label={t('caseWithdrawal.request.taxWithholdings.dontWithhold')}
                    onClick={() => {
                        setDontWithhold(!dontWithhold);
                    }}
                    position="single"
                    disabled={isFormStateReadOnly}
                />
                <Field
                    formatOptions={numberFormat}
                    leading={<div>$</div>}
                    onChange={e => {
                        setDollarAmount(xss(e?.target?.value));
                    }}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={dollarAmount || ''}
                    variant={isFormStateReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
                />
                <Field
                    formatOptions={numberFormat}
                    onChange={e => {
                        setPercentAmount(xss(e?.target?.value));
                    }}
                    size={FieldSize.Small}
                    trailing={<div>%</div>}
                    type={FieldType.BaseActive}
                    value={percentAmount || ''}
                    variant={isFormStateReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
                />
                {selectMin && <ButtonGroupItem
                    checked={selectMinimum}
                    className={getClasses(selectMinimum)}
                    dataTestId={`${place}-tax-withholding-select-minimum`}
                    label={t('caseWithdrawal.request.taxWithholdings.selectMin')}
                    onClick={() => {
                        setSelectMinimum(!selectMinimum);
                    }}
                    position="single"
                    disabled={isFormStateReadOnly}
                />}
                {additionalWithHoldingConfig?.amountType && selectMinimum ? (
                    <Field
                        formatOptions={numberFormat}
                        onChange={e => {
                            setAdditionalPercentAmount(xss(e?.target?.value));
                        }}
                        size={FieldSize.Small}
                        trailing={<div>%</div>}
                        type={FieldType.BaseActive}
                        value={additionalPercentAmount || ''}
                        variant={isFormStateReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
                        disabled={isFormStateReadOnly}
                    />
                ) : null}
            </div>
        </div>
    );
};

export default TaxWithholdingRow;
