import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';

import BeneficiaryInfo from '@deps/components/otp-withdrawal-form/beneficiary-information/beneficiary-info';
import CslnCheck from '@deps/components/otp-withdrawal-form/csln-check';
import FormDistribution from '@deps/components/otp-withdrawal-form/distribution-instructions/form-distribution';
import FormDisbursement from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement';
import FormParties from '@deps/components/otp-withdrawal-form/form-party/form-party';
import IrsWithholding from '@deps/components/otp-withdrawal-form/irs-withholdings';
import RMDMethod from '@deps/components/otp-withdrawal-form/rmd-method/rmd-method';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import StateW4Form from '@deps/components/otp-withdrawal-form/state-w4-form';
import TaxWithholdings from '@deps/components/otp-withdrawal-form/tax-withholdings';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { getOwnerStateOfResidence } from '@deps/helpers/otp-withdrawal.helper';
import { Carrier, FundWithdrawnMethod } from '@deps/models/case/withdrawal/case';
import { isAllowedState } from '@deps/utils/renderStateW4';

import getUlpcRmdConfig from './ulpc-rmd-form.helper';

export default function UlpcRmdWithdrawalForm() {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });
    const {
        signaturesConfig,
        formPartyConfigs,
        cslnCheckStates,
        irsSignatureConfig,
        formValidation,
        w4pSignaturesConfig,
        disbursementOptions,
        isBeneSpouseOption,
        fundWithdrawnMethodOptions,
        beneficiaryConfig
    } = getUlpcRmdConfig(t);

    const {
        formParty,
        setFormData,
        formData,
        initialForm,
        setFormValidator,
        ownerStateOfResidence,
        setOwnerStateOfResidence,
        contractIssueState,
        isFormStateReadOnly,
        formBeneInfo,
        setFormBeneInfo,
    } = useContext(FormDataContext);

    useEffect(() => {
        setFormValidator(() => formValidation);
    }, []);

    useEffect(() => {
        setFormData({
            ...formData,
            formExtName: `${initialForm?.carrier || Carrier.ULPC}_RMD_DIGITAL_FORM`,
            metaData: {
                formType: `${initialForm?.carrier || Carrier.ULPC}_RMD_DIGITAL_FORM`,
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
    }, [formParty]);

    const shouldStateW4pRender = isAllowedState(contractIssueState);

    return (
        <>
            {!isFormStateReadOnly && <DiaryNotesWarning />}
            <FormParties isFormStateReadOnly={isFormStateReadOnly} configs={formPartyConfigs} />
            <RMDMethod isFormStateReadOnly={isFormStateReadOnly} />
            <BeneficiaryInfo
                isFormStateReadOnly={isFormStateReadOnly}
                beneInfo={formBeneInfo}
                onBeneChange={setFormBeneInfo}
                isBeneSpouseOption={isBeneSpouseOption}
                configs={beneficiaryConfig}
            />
            <FormDistribution
                isFormStateReadOnly={isFormStateReadOnly}
                fundWithdrawnMethodOptions={fundWithdrawnMethodOptions}
                title={t('distributionInstruction.distributionInstruction') as string}
                isDerivedMethodFromFunds={true}
                defaultMethod={FundWithdrawnMethod.Prorata}
            />
            <TaxWithholdings isFormStateReadOnly={isFormStateReadOnly} />
            <IrsWithholding isFormStateReadOnly={isFormStateReadOnly} signatureFields={irsSignatureConfig} />
            {shouldStateW4pRender && <StateW4Form isFormStateReadOnly={isFormStateReadOnly} w4pSignaturesConfig={w4pSignaturesConfig} />}
            <FormDisbursement isFormStateReadOnly={isFormStateReadOnly} options={disbursementOptions} />
            {(ownerStateOfResidence || contractIssueState) &&
                [ownerStateOfResidence, contractIssueState].some(state => state && cslnCheckStates.includes(state)) && (
                    <CslnCheck isFormStateReadOnly={isFormStateReadOnly} />
                )}
            <SignatureValidations isFormStateReadOnly={isFormStateReadOnly} config={signaturesConfig} />
        </>
    );
}
