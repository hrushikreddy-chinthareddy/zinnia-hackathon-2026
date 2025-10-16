import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';
import React from 'react';

import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import { DATE_PICKER_FORMAT } from '@deps/components/fields/field-date-select/field-date-select';
import SelectSimple from '@deps/components/select/select';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import {
    ESignature,
    SelectionStateYesNo,
} from './e-signature-validation.helpers';
import SignatureDateCore from '../signature-validation/signature-validation-parts/core/signature-date-core';
import { SignatureFieldNames } from '../signature-validation/signature-validation-parts/signature-parts';

interface ESignatureFieldsProps {
    eSignatures: Array<ESignature>;
    fieldConfig: {
        type: boolean;
        signPresent: boolean;
        date: boolean;
        auditTrial?: boolean;
        accordForm?: boolean;
    };
    formErrors: Record<string, string>;
    selectYesNoOptions: { label: string; value: SelectionStateYesNo }[];
    updateFormESignatureField: (
        index: number,
        field: string,
        value: string | object | boolean
    ) => void;
    t: TFunction;
    isFormStateReadOnly: boolean;
}

const ESignatureFields: React.FC<ESignatureFieldsProps> = ({
    eSignatures,
    fieldConfig,
    formErrors,
    selectYesNoOptions,
    updateFormESignatureField,
    isFormStateReadOnly,
    t,
}) => {
    return (
        <>
            {eSignatures?.map((signature, index) => (
                <div className="grid grid-cols-5 gap-4 mt-5" key={index}>
                    {fieldConfig?.type && (
                        <Field
                            label={t('type') as string}
                            onChange={() => undefined}
                            size={FieldSize.Small}
                            value={signature?.signType?.text || ''}
                            variant={FieldVariant.Inactive}
                            type={FieldType.BaseActive}
                            data-testid={`${signature?.signType?.text}-type`}
                            disabled={isFormStateReadOnly}
                            isReadOnly
                        />
                    )}

                    {fieldConfig?.signPresent && (
                        <SelectSimple
                            message={
                                formErrors[
                                    `${signature?.signType?.text}-signPresent`
                                ]
                            }
                            label={t('signPresent') as string}
                            onChange={(value) =>
                                updateFormESignatureField(
                                    index,
                                    'isSigned',
                                    value === SelectionStateYesNo.Yes
                                )
                            }
                            options={selectYesNoOptions}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={
                                signature?.isSigned === null
                                    ? SelectionStateYesNo.Unselected
                                    : signature?.isSigned
                                    ? SelectionStateYesNo.Yes
                                    : SelectionStateYesNo.No
                            }
                            disabled={isFormStateReadOnly}
                            name={`${signature?.isSigned}-signature-present`}
                        />
                    )}

                    {fieldConfig?.date && (
                        <SignatureDateCore
                            errors={formErrors}
                            signDate={signature?.signDate?.text}
                            setSignDate={(value) =>
                                updateFormESignatureField(index, 'signDate', {
                                    text: dayjs(
                                        value,
                                        DATE_PICKER_FORMAT
                                    ).format(ZAHARA_API_DATE_FORMAT),
                                })
                            }
                            signType={
                                signature?.signType
                                    ?.text as SignatureValidationTypeWithdrawal
                            }
                            fieldName={SignatureFieldNames.SignatureDate}
                            label={t('date') as string}
                            testId={'signature-date'}
                            disabled={isFormStateReadOnly}
                            variant={
                                isFormStateReadOnly
                                    ? FieldVariant.Inactive
                                    : FieldVariant.Default
                            }
                        />
                    )}

                    {fieldConfig?.auditTrial && (
                        <SelectSimple
                            label={t('auditTrial') as string}
                            onChange={(value) =>
                                updateFormESignatureField(
                                    index,
                                    'isAuditTrail',
                                    value === SelectionStateYesNo.Yes
                                )
                            }
                            options={selectYesNoOptions}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={
                                signature?.isAuditTrail === null
                                    ? SelectionStateYesNo.Unselected
                                    : signature?.isAuditTrail
                                    ? SelectionStateYesNo.Yes
                                    : SelectionStateYesNo.No
                            }
                            disabled={isFormStateReadOnly}
                        />
                    )}

                    {fieldConfig?.accordForm && (
                        <SelectSimple
                            label={t('accordForm') as string}
                            onChange={(value) =>
                                updateFormESignatureField(
                                    index,
                                    'isAccordForm',
                                    value === SelectionStateYesNo.Yes
                                )
                            }
                            options={selectYesNoOptions}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={
                                signature?.isAccordForm === null
                                    ? SelectionStateYesNo.Unselected
                                    : signature?.isAccordForm
                                    ? SelectionStateYesNo.Yes
                                    : SelectionStateYesNo.No
                            }
                            disabled={isFormStateReadOnly}
                        />
                    )}
                </div>
            ))}
        </>
    );
};

export default ESignatureFields;
