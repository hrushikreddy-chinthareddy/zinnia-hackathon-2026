import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import { DATE_PICKER_FORMAT } from '@deps/components/fields/field-date-select/field-date-select';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import SignatureDateCore from './core/signature-date-core';
import { CommissionExpireDateProps, SignatureFieldNames } from './signature-parts';
import { selectVarientByConfig } from '../../form-party/form-party';
import { SignatureValidationContext } from '../signature-validation-context';

export default function CommissionExpireDate({ isFormStateReadOnly = false }: CommissionExpireDateProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.signatureValidation' });
    const { errors, commissionExpiryDate, setCommissionExpiryDate, signType } = useContext(SignatureValidationContext);

    const setSignDateHandler = (date: string | null) => {
        setCommissionExpiryDate({ text: dayjs(date, DATE_PICKER_FORMAT).format(ZAHARA_API_DATE_FORMAT) });
    };

    return (
        <SignatureDateCore
            errors={errors}
            signDate={commissionExpiryDate?.text}
            setSignDate={setSignDateHandler}
            signType={signType.text}
            fieldName={SignatureFieldNames.CommissionExpireDate}
            label={t('commissionExpiresOn') as string}
            testId={'commission-expiry-date'}
            disabled={isFormStateReadOnly}
            variant={selectVarientByConfig({
                value: commissionExpiryDate?.text || '',
                isFormStateReadOnly,
                error: errors[SignatureFieldNames.SignatureDate],
            })}
        />
    );
}
