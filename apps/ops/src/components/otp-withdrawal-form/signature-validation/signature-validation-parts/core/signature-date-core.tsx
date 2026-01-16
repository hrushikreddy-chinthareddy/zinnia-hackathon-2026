import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

import {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import FieldDateSelect, {
    DATE_PICKER_FORMAT,
} from '@deps/components/fields/field-date-select/field-date-select';
import { getFormattedDate } from '@deps/helpers/date.helpers';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

import { SignatureFieldNames } from '../signature-parts';

export type SignatureDateCoreProps = {
    errors: FormValidationErrors;
    signDate?: string | null;
    signType: SignatureValidationTypeWithdrawal | null;
    setSignDate: (date: string | null) => void;
    fieldName: SignatureFieldNames;
    label: string;
    testId: string;
    variant?: FieldVariant;
    disabled?: boolean;
};

export default function SignatureDateCore({
    errors,
    signDate,
    setSignDate,
    signType,
    fieldName,
    label,
    testId,
    variant,
    disabled,
}: SignatureDateCoreProps) {
    const [signatureDate, setSignatureDate] = useState(
        getFormattedDate(signDate, 'SignatureDateCore::input signDate')
    );

    useEffect(() => {
        if (dayjs(signatureDate, DATE_PICKER_FORMAT).isValid()) {
            setSignDate(signatureDate);
        }
    }, [signatureDate]);

    return (
        <FieldDateSelect
            isFutureDateDisabled={false}
            label={label}
            data-testid={`${signType}-${testId}`}
            message={errors[fieldName]}
            onChange={(e) => {
                setSignatureDate(e.target.value);
            }}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={signatureDate}
            variant={variant}
            disabled={disabled}
        />
    );
}
