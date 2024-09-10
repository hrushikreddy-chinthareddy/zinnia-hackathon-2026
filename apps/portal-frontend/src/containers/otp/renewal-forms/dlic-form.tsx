import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';

import CallReceiveDate from '@deps/components/otp-renewal-form/call-receive-date';
import GeneralInformation from '@deps/components/otp-renewal-form/general-information';
import OwnerInformation from '@deps/components/otp-renewal-form/owner-information/owner-information';
import RenewalPeriodMultiSection from '@deps/components/otp-renewal-form/renewal-period-multi-selection';
import RenewalPeriodSingleSection from '@deps/components/otp-renewal-form/renewal-period-single-selection';
import SignatureValidations from '@deps/components/otp-renewal-form/signature-validation/signature-validation';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { RenewalFormDataContext } from '@deps/contexts/OtpRenewalFormContext';
import { Channel } from '@deps/models/case/renewal/case-renewal';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';

import getDlicConfig from './dlic-form.helper';

export enum DlicPlanCodes {
    'planCode730' = '730',
    'planCode729' = '729',
    'planCode689' = '689',
}

const getValidPlancodes = (featureFlags: FeatureFlags) => {
    const validPlanCodes = [];

    if (featureFlags?.[FEATURE_FLAGS.DLIC_RENEWAL_PLANCODE_730]) {
        validPlanCodes.push(DlicPlanCodes.planCode730);
    }

    if (featureFlags?.[FEATURE_FLAGS.DLIC_RENEWAL_PLANCODE_729]) {
        validPlanCodes.push(DlicPlanCodes.planCode729);
    }

    if (featureFlags?.[FEATURE_FLAGS.DLIC_RENEWAL_PLANCODE_689]) {
        validPlanCodes.push(DlicPlanCodes.planCode689);
    }
    return validPlanCodes;
}

export default function DlicRenewalForm() {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseRenewal.request' });
    const { channel, setFormValidator, renewalRequestSignDate, ownerInformation, isFormStateReadOnly, setRenewalRequestSignDate, planCode, featureFlags } =
        useContext(RenewalFormDataContext);
    const { formPartyConfigs, signatureConfigs, formValidation, periodRadioItems, transList } = getDlicConfig(t);
    const validPlanCodes = getValidPlancodes(featureFlags);

    useEffect(() => {
        setFormValidator(() => formValidation);
    }, []);

    useEffect(() => {
        const owner = ownerInformation?.find(owner => owner.type === 'Primary');
        const renewalDate = channel === Channel.Form ? owner?.signature.signDate || 'NA' : renewalRequestSignDate;

        setRenewalRequestSignDate(renewalDate);
    }, [channel, ownerInformation, renewalRequestSignDate]);

    return (
        <>
            {!isFormStateReadOnly && <DiaryNotesWarning />}
            <br />
            <GeneralInformation isFormStateReadOnly={isFormStateReadOnly} />
            <OwnerInformation isFormStateReadOnly={isFormStateReadOnly} configs={formPartyConfigs} />
            <hr className="my-4 h-0.5 border-none bg-gray-100 px-4" />
            { (validPlanCodes.includes(planCode as DlicPlanCodes))
                ? <RenewalPeriodMultiSection isFormStateReadOnly={isFormStateReadOnly} options={transList} planCode={planCode} />
                : <RenewalPeriodSingleSection isFormStateReadOnly={isFormStateReadOnly} options={periodRadioItems} />
            }
            <hr className="my-4 h-0.5 border-none bg-gray-100 px-4" />
            {channel === Channel.Phone && <CallReceiveDate isFormStateReadOnly={isFormStateReadOnly} />}
            {channel === Channel.Form && <SignatureValidations isFormStateReadOnly={isFormStateReadOnly} configs={signatureConfigs} />}
        </>
    );
}
