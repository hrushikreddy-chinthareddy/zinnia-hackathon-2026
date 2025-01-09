import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';

import CedingCompanyDistribution from '@deps/components/otp-withdrawal-form/ceding-company-distribution';
import FormDisbursement from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement';
import FormParties from '@deps/components/otp-withdrawal-form/form-party/form-party';
import FormProgramPartialWithdrawal from '@deps/components/otp-withdrawal-form/form-program/form-program-partial-withdrawal';
import DistributionReason from '@deps/components/otp-withdrawal-form/form-restriction/distribution-reason';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { getOwnerStateOfResidence } from '@deps/helpers/otp-withdrawal.helper';
import { Carrier, QualTypes } from '@deps/models/case/withdrawal/case';

import getNasuOftConfig from './nasu-oft-form.helper';

type NasuOftFormProps = {
    qualType: QualTypes | '';
};

export default function NasuOftWithdrawalForm( { qualType }: NasuOftFormProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });
    const {
        signaturesConfig,
        formPartyConfigs,
        formValidation,
        disbursementOptions,
        surrenderingInstructionsOptions,
        identifySelectedFormProgramOption,
        selectOneOptions,
        defaultValues,
        qualificationOptions,
        reasonOptions
    } = getNasuOftConfig(t);

    const {
        formParty,
        setFormData,
        formData,
        initialForm,
        setFormValidator,
        ownerStateOfResidence,
        isFormStateReadOnly,
        setOwnerStateOfResidence,
    } = useContext(FormDataContext);

    useEffect(() => {
        setFormValidator(() => formValidation);
    }, []);

    useEffect(() => {
        setFormData({
            ...formData,
            formExtName: `${initialForm?.carrier || Carrier.NASU}_OFT_DIGITAL_FORM`,
            metaData: {
                formType: `${initialForm?.carrier || Carrier.NASU}_OFT_DIGITAL_FORM`,
                formId: null,
                formNumber: '',
            },
        });
    }, [initialForm]);

    useEffect(() => {
        const newOwnerStateOfResidence = getOwnerStateOfResidence(formParty);
        if (newOwnerStateOfResidence !== ownerStateOfResidence) {
            setOwnerStateOfResidence(newOwnerStateOfResidence);
        }
    }, [formParty, ownerStateOfResidence]);

    const is403b = [QualTypes.b403].includes(qualType as QualTypes);

    return (
        <>
            {!isFormStateReadOnly && <DiaryNotesWarning />}
            <FormParties isFormStateReadOnly={isFormStateReadOnly} configs={formPartyConfigs} />
            { is403b && <DistributionReason reasonOptions={reasonOptions} isFormStateReadOnly={isFormStateReadOnly} /> }
            <FormProgramPartialWithdrawal
                isFormStateReadOnly={isFormStateReadOnly}
                options={surrenderingInstructionsOptions}
                title={t('amountDetails.surrenderingInstructions.title') as string}
                selectionIdentifier={identifySelectedFormProgramOption}
                selectOneOptions={selectOneOptions}
            />
            <SignatureValidations isFormStateReadOnly={isFormStateReadOnly} config={signaturesConfig} />
            <CedingCompanyDistribution
                qualificationOptions={qualificationOptions}
                isFormStateReadOnly={isFormStateReadOnly}
                renderLoaDate={true}
            />
            <FormDisbursement
                options={disbursementOptions}
                isFormStateReadOnly={isFormStateReadOnly}
                title={t('distributionMethod.cedingCompanyDistribution') as string}
                defaultValue={defaultValues.disbursementOption}
            />
        </>
    );
}
