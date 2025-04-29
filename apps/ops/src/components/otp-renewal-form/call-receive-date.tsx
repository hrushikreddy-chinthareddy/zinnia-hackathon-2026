import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import { RenewalFormDataContext } from '@deps/contexts/OtpRenewalFormContext';
import { Channel } from '@deps/models/case/renewal/case-renewal';
import { NUMERIC_DATE_FORMAT, ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import { FieldSize, FieldType } from '../fields/field';
import FieldDateSelect, { DATE_PICKER_FORMAT } from '../fields/field-date-select/field-date-select';
import { selectVarientByConfig } from '../otp-withdrawal-form/form-party/form-party';
import Typography, { TypographyVariant } from '../typography/typography';

interface CallReceiveDateProps {
    isFormStateReadOnly: boolean,
}

export default function CallReceiveDate({ isFormStateReadOnly }:CallReceiveDateProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseRenewal.request' });
    const { setRenewalRequestSignDate, channel, formErrors, renewalRequestSignDate } = useContext(RenewalFormDataContext);
    const renewalRequestDt = renewalRequestSignDate ? dayjs(renewalRequestSignDate, ZAHARA_API_DATE_FORMAT).format(NUMERIC_DATE_FORMAT) : '';
    const [date, setDate] = useState(renewalRequestDt || '');

    useEffect(() => {
        const selectedDate = date ? dayjs(date, DATE_PICKER_FORMAT).format(ZAHARA_API_DATE_FORMAT) : '';
        channel === Channel.Phone && setRenewalRequestSignDate(selectedDate);
    }, [date]);

    return (
        <>
            <Typography variant={TypographyVariant.H3} className="mb-4">
                {t('callValidation')}
            </Typography>
            <div className="mb-4 flex">
                <FieldDateSelect
                    label={t('callReceivedDate') as string}
                    onChange={e => {
                        setDate(e.target.value);
                    }}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={date}
                    variant={selectVarientByConfig({ value: date, isFormStateReadOnly, error: formErrors['callReceivedDate']})}
                    message={formErrors['callReceivedDate']}
                    disabled={isFormStateReadOnly}
                />
            </div>
        </>
    );
}
