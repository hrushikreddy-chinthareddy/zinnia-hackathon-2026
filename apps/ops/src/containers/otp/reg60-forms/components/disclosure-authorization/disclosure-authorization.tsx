import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useState, useEffect, ChangeEvent } from 'react';

import Field, { FieldFormat, FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import FieldDateSelect from '@deps/components/fields/field-date-select/field-date-select';
import { selectVarientByConfig } from '@deps/components/otp-withdrawal-form/form-party/form-party';
import SelectSimple from '@deps/components/select/select';
import { SimpleOption } from '@deps/components/select/select.helpers';
import { TranslationFiles } from '@deps/config/translations';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
import { NUMERIC_DATE_FORMAT, ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import { cdscPeriodOptions, productOptions } from './disclosure-authorization.helpers';
import {
    DisclosureAuthorizationFields,
    DisclosureAuthorizationFieldConfig,
    DisclosureAuthorizationInformation,
    Products,
    CDSCPeriods,
    DisclosureAuthorizationProps,
} from './disclosure-authorization.types';

export function useDisclosureAuthorizationFields(
    disclosureAuthorization: DisclosureAuthorizationInformation,
    planCode: string,
    formErrors?: FormValidationErrors,
    isFormStateReadOnly?: boolean
) {
    const { t } = useTranslation(TranslationFiles.REG60DEFS, { keyPrefix: 'caseReg60.request.disclosureAuthorization' });

    const [signatureDate, setSignatureDate] = useState(disclosureAuthorization?.signatureDate || '');
    const [expectedAcctValue, setExpectedAcctValue] = useState(disclosureAuthorization?.expectedAcctValue || '');
    const [product, setProduct] = useState(disclosureAuthorization?.product || '');
    const [cdscPeriod, setCdscPeriod] = useState(disclosureAuthorization?.cdscPeriod || '');
    const [isCdscPeriodDisabled, setIsCdscPeriodDisabled] = useState(disclosureAuthorization?.cdscPeriod === CDSCPeriods.NA ? true : false);
    const [currentDisclosureAuthorization, setCurrentDisclosureAuthorization] = useState(disclosureAuthorization);

    const numberFormat = { type: 'number' as FieldFormat, decimalPlaces: 2, format: '' };

    const handleSetSignatureDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        const formattedDate = dayjs(e.target.value, NUMERIC_DATE_FORMAT).format(ZAHARA_API_DATE_FORMAT);
        if (dayjs(formattedDate).isValid()) {
            setSignatureDate(formattedDate);
        }
    };
    useEffect(() => {
        if (product === Products.retireEase || product === Products.retireEaseChoice) {
            setCdscPeriod('');
            setIsCdscPeriodDisabled(true);
        } else {
            setCdscPeriod(cdscPeriod);
            setIsCdscPeriodDisabled(false);
        }
        setCurrentDisclosureAuthorization({
            signatureDate,
            expectedAcctValue,
            product,
            cdscPeriod,
        });
    }, [signatureDate, expectedAcctValue, product, cdscPeriod, disclosureAuthorization]);

    const cdscPeriodField = (label?: string) => (
        <SelectSimple
            label={label || (t(`cdscPeriod`) as string)}
            onChange={(val: string) => setCdscPeriod(val as CDSCPeriods)}
            options={cdscPeriodOptions(t, planCode) as SimpleOption[]}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={cdscPeriod}
            message={formErrors?.cdscPeriod}
            variant={formErrors?.cdscPeriod ? FieldVariant.Error : FieldVariant.Default}
            data-testid="cdsc-period-test-id"
            disabled={isCdscPeriodDisabled || isFormStateReadOnly}
            required
        />
    );

    const expectedAcctValueField = (label?: string) => (
        <Field
            formatOptions={numberFormat}
            leading={<div>$</div>}
            onChange={e => setExpectedAcctValue(Number(e.target.value))}
            label={label || (t(`expectedAcctValue`) as string)}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={expectedAcctValue as string}
            message={formErrors?.expectedAcctValue}
            variant={selectVarientByConfig({
                value: expectedAcctValue as string,
                isFormStateReadOnly,
                error: formErrors?.expectedAcctValue,
            })}
            data-testid="expected-acct-value-test-id"
            required
            disabled={isFormStateReadOnly}
        />
    );

    const productField = (label?: string) => (
        <SelectSimple
            label={label || (t(`product`) as string)}
            onChange={(val: string) => setProduct(val as Products)}
            options={productOptions(t, planCode) as SimpleOption[]}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={product}
            message={formErrors?.product}
            variant={formErrors?.product ? FieldVariant.Error : FieldVariant.Default}
            data-testid="product-test-id"
            required
            disabled={isFormStateReadOnly}
        />
    );

    const signatureDateField = (label?: string) => (
        <FieldDateSelect
            className={formErrors?.signatureDate && 'border-2 border-solid border-semantic-error'}
            label={label || (t(`signatureDate`) as string)}
            onChange={handleSetSignatureDateChange}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={signatureDate ? dayjs(signatureDate, 'YYYY-MM-DD').format(NUMERIC_DATE_FORMAT) : ''}
            message={formErrors?.signatureDate}
            variant={selectVarientByConfig({
                value: signatureDate || '',
                isFormStateReadOnly,
                error: formErrors?.signatureDate,
            })}
            data-testid="signature-date-test-id"
            required
            disabled={isFormStateReadOnly}
        />
    );

    const renderField = (field: DisclosureAuthorizationFieldConfig): JSX.Element | null => {
        switch (field.fieldName) {
            case DisclosureAuthorizationFields.CdscPeriod:
                return (
                    <div className="col-span-2" key={field.fieldName}>
                        {cdscPeriodField(field.fieldLabel)}
                    </div>
                );
            case DisclosureAuthorizationFields.ExpectedAcctValue:
                return <div key={field.fieldName}>{expectedAcctValueField(field.fieldLabel)}</div>;
            case DisclosureAuthorizationFields.Product:
                return (
                    <div className="col-span-2" key={field.fieldName}>
                        {productField(field.fieldLabel)}
                    </div>
                );
            case DisclosureAuthorizationFields.SignatureDate:
                return <div key={field.fieldName}>{signatureDateField(field.fieldLabel)}</div>;

            default:
                return null;
        }
    };

    return {
        renderField,
        currentDisclosureAuthorization,
    };
}

export function DisclosureAuthorization({
    fields,
    disclosureAuthorizationInfo,
    formErrors,
    onDataChange,
    isFormStateReadOnly,
    planCode,
}: DisclosureAuthorizationProps) {
    const { renderField, currentDisclosureAuthorization } = useDisclosureAuthorizationFields(
        disclosureAuthorizationInfo,
        planCode,
        formErrors,
        isFormStateReadOnly
    );

    useEffect(() => {
        onDataChange(currentDisclosureAuthorization);
    }, [currentDisclosureAuthorization]);

    return <div className="my-4 grid w-full grid-cols-3 gap-4">{fields?.map(renderField)}</div>;
}
