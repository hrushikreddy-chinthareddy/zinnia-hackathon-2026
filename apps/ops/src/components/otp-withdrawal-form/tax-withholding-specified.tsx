import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import xss from 'xss';

import ButtonGroupItem from '@deps/components/button-group/button-group-item/button-group-item';
import Field, {
    FieldFormat,
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import FieldLabel from '@deps/components/fields/field-label';

import { TaxWithholdingRowProp, getClasses } from './tax-withholding-row';

const TaxWithholdingSpecified: React.FC<TaxWithholdingRowProp> = ({
    className,
    label,
    onDataChange,
    place,
    withholding,
    additionalWithHoldingConfig = null,
    isFormStateReadOnly,
}) => {
    const { t } = useTranslation();
    const [dollarAmount, setDollarAmount] = useState<string | null>(
        withholding?.dollarAmount || null
    );
    const [dontWithhold, setDontWithhold] = useState<boolean>(
        withholding?.dontWithhold || false
    );
    const [percentAmount, setPercentAmount] = useState<string | null>(
        withholding?.percentAmount || null
    );
    const [additionalPercentAmount, setAdditionalPercentAmount] = useState<
        string | null
    >(withholding?.additionalPercentAmount || null);
    const [selectMinimum, setSelectMinimum] = useState<boolean>(
        withholding?.selectMinimum || false
    );
    const [specifiedWithholding, setSpecifiedWithholding] = useState<boolean>(
        withholding?.specified || false
    );
    const numberFormat = {
        type: 'number' as FieldFormat,
        decimalPlaces: 2,
        format: '',
    };

    useEffect(() => {
        onDataChange({
            dollarAmount,
            dontWithhold,
            percentAmount,
            place,
            selectMinimum,
            additionalPercentAmount,
            specified: specifiedWithholding,
        });
    }, [
        dollarAmount,
        dontWithhold,
        percentAmount,
        selectMinimum,
        additionalPercentAmount,
        specifiedWithholding,
    ]);

    return (
        <div className={className} data-testid={`${place}-tax-withholding-row`}>
            <FieldLabel label={label} />
            <div className="md:grid-cols-auto-5 grid w-full grid-cols-5 grid-rows-2 gap-2 md:grid-rows-1">
                <ButtonGroupItem
                    className={getClasses(dontWithhold)}
                    checked={dontWithhold}
                    dataTestId={`${place}-tax-withholding-do-not-withhold`}
                    label={t(
                        'caseWithdrawal.request.taxWithholdings.dontWithhold'
                    )}
                    onClick={() => {
                        setDontWithhold(!dontWithhold);
                    }}
                    position="single"
                    disabled={isFormStateReadOnly}
                />

                <ButtonGroupItem
                    checked={selectMinimum}
                    className={getClasses(selectMinimum)}
                    dataTestId={`${place}-tax-withholding-select-minimum`}
                    label={t(
                        'caseWithdrawal.request.taxWithholdings.selectMin'
                    )}
                    onClick={() => {
                        setSelectMinimum(!selectMinimum);
                    }}
                    position="single"
                    disabled={isFormStateReadOnly}
                />
                {additionalWithHoldingConfig?.amountType && selectMinimum ? (
                    <Field
                        formatOptions={numberFormat}
                        onChange={(e) => {
                            setAdditionalPercentAmount(xss(e?.target?.value));
                        }}
                        size={FieldSize.Small}
                        trailing={<div>%</div>}
                        type={FieldType.BaseActive}
                        value={additionalPercentAmount || ''}
                        variant={
                            isFormStateReadOnly
                                ? FieldVariant.Inactive
                                : FieldVariant.Default
                        }
                        disabled={isFormStateReadOnly}
                    />
                ) : null}

                <ButtonGroupItem
                    checked={specifiedWithholding}
                    className={getClasses(specifiedWithholding)}
                    dataTestId={`${place}-tax-withholding-select-specified`}
                    label={t(
                        'caseWithdrawal.request.taxWithholdings.specified'
                    )}
                    onClick={() => {
                        setSpecifiedWithholding(!specifiedWithholding);
                    }}
                    position="single"
                    disabled={isFormStateReadOnly}
                />
            </div>
            {specifiedWithholding && (
                <div className="my-6 grid w-full grid-cols-5 grid-rows-2 gap-2 md:grid-cols-5 md:grid-rows-1">
                    <Field
                        formatOptions={numberFormat}
                        leading={<div>$</div>}
                        onChange={(e) => {
                            setDollarAmount(xss(e?.target?.value));
                        }}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        value={dollarAmount || ''}
                        variant={
                            isFormStateReadOnly
                                ? FieldVariant.Inactive
                                : FieldVariant.Default
                        }
                        disabled={isFormStateReadOnly}
                    />
                    <Field
                        formatOptions={numberFormat}
                        onChange={(e) => {
                            setPercentAmount(xss(e?.target?.value));
                        }}
                        size={FieldSize.Small}
                        trailing={<div>%</div>}
                        type={FieldType.BaseActive}
                        value={percentAmount || ''}
                        variant={
                            isFormStateReadOnly
                                ? FieldVariant.Inactive
                                : FieldVariant.Default
                        }
                        disabled={isFormStateReadOnly}
                    />
                </div>
            )}
        </div>
    );
};

export default TaxWithholdingSpecified;
