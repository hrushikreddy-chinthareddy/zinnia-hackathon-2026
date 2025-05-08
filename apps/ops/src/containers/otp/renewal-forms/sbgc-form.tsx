import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';

import CallReceiveDate from '@deps/components/otp-renewal-form/call-receive-date';
import ContractValue from '@deps/components/otp-renewal-form/contract-value/ContractValue';
import GeneralInformation from '@deps/components/otp-renewal-form/general-information';
import OwnerInformation from '@deps/components/otp-renewal-form/owner-information/owner-information';
import RenewalPeriodMultiSection from '@deps/components/otp-renewal-form/renewal-period-multi-selection';
import SignatureValidations from '@deps/components/otp-renewal-form/signature-validation/signature-validation';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { RenewalFormDataContext } from '@deps/contexts/OtpRenewalFormContext';
import { Channel } from '@deps/models/case/renewal/case-renewal';

import getSbgcRenewalConfig from './sbgc-form.helpers';

export default function SbgcRenewalForm() {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseRenewal.request' });

    const {
        channel,
        setFormValidator,
        renewalRequestSignDate,
        ownerInformation,
        isFormStateReadOnly,
        setRenewalRequestSignDate,
        planCode,
    } = useContext(RenewalFormDataContext);
    const { formPartyConfigs, signatureConfigs, formValidation, transList } = getSbgcRenewalConfig(t);

    useEffect(() => {
        setFormValidator(() => formValidation);
    }, []);

    useEffect(() => {
        const owner = ownerInformation?.find(owner => owner.type === 'Primary');
        const renewalDate = channel === Channel.Form ? owner?.signature?.signDate || 'NA' : renewalRequestSignDate;

        setRenewalRequestSignDate(renewalDate);
    }, [channel, ownerInformation, renewalRequestSignDate]);

    return (
        <>
            {!isFormStateReadOnly && <DiaryNotesWarning />}
            <br />
            <GeneralInformation isFormStateReadOnly={isFormStateReadOnly} />
            <OwnerInformation isFormStateReadOnly={isFormStateReadOnly} configs={formPartyConfigs} />
            <ContractValue isFormStateReadOnly={isFormStateReadOnly} />
            <hr className="my-4 h-0.5 border-none bg-gray-100 px-4" />
            <RenewalPeriodMultiSection isFormStateReadOnly={isFormStateReadOnly} options={transList} planCode={planCode} />
            <hr className="my-4 h-0.5 border-none bg-gray-100 px-4" />
            {channel === Channel.Phone && <CallReceiveDate isFormStateReadOnly={isFormStateReadOnly} />}
            {channel === Channel.Form && <SignatureValidations isFormStateReadOnly={isFormStateReadOnly} configs={signatureConfigs} />}
        </>
    );
}
