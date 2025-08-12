import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import { DATE_PICKER_FORMAT } from '@deps/components/fields/field-date-select/field-date-select';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import SignatureDateCore from './core/signature-date-core';
import { SignatureDateProps, SignatureFieldNames } from './signature-parts';
import { selectVarientByConfig } from '../../form-party/form-party';
import { SignatureValidationContext } from '../signature-validation-context';

export default function SignatureDate({
    isFormStateReadOnly = false,
}: SignatureDateProps) {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.signatureValidation',
    });
    const { errors, signDate, setSignDate, signType } = useContext(
        SignatureValidationContext
    );

    const setSignDateHandler = (date: string | null) => {
        setSignDate({
            text: dayjs(date, DATE_PICKER_FORMAT).format(
                ZAHARA_API_DATE_FORMAT
            ),
        });
    };

    return (
        <SignatureDateCore
            errors={errors}
            signDate={signDate?.text}
            setSignDate={setSignDateHandler}
            signType={signType?.text}
            fieldName={SignatureFieldNames.SignatureDate}
            label={t('date') as string}
            testId={'signature-date'}
            variant={selectVarientByConfig({
                value: signDate?.text || '',
                isFormStateReadOnly,
                error: errors[SignatureFieldNames.SignatureDate],
            })}
            disabled={isFormStateReadOnly}
        ></SignatureDateCore>
    );
}
