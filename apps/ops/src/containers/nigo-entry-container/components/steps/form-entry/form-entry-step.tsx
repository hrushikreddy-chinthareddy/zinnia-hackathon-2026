import { AssistiveText, AssistiveTextVariant, Loader } from '@zinnia/bloom/components';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import { useContext, useState } from 'react';

import 'react-pdf/dist/Page/TextLayer.css';

import TransactionNavigationButtons, { ParentPage } from "@deps/components/transaction-navigation-buttons/transaction-navigation-buttons";
import WorkflowCard from "@deps/components/workflows/workflow-card/workflow-card";
import { TranslationFiles } from '@deps/config/translations';
import { CarrierToCarrierTitleMap } from '@deps/constants/page-title';
import { FormErrors } from '@deps/containers/otp/reg60-forms/components/form-errors';
import { DiaryNotesContext } from '@deps/contexts/DiaryNotesContext';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { isNonProductionEnvironment } from '@deps/helpers/environment.helper';
import { useAccountInfo } from '@deps/hooks/otp-withdrawal/useAccountInfo';
import { DocumentData } from '@deps/models/case/document';
import { ERROR_CODES } from '@deps/pages/create-case/error';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import { getCaseType, getFormParts } from './form-entry-step.helper';


type FormEntryStepProps = {
    document: DocumentData;
    clientCode: string;
    docType: string;
};

function FormEntryStep({document, clientCode, docType} : FormEntryStepProps) {
    const router = useRouter();
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'nigoEntry.formEntry' });
    const { t: withdrawalTxt} = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });
    const { goToNext } = useWorkflow();
    const { qualType } = useAccountInfo(document.contract, clientCode);
    const caseType = getCaseType(docType as string);
    const formState = useContext(FormDataContext);
    const shouldShowNewExperience = formState.featureFlagDecisions?.[FEATURE_FLAGS.NEW_EXP];
    const isFormStateReadOnly = shouldShowNewExperience ? formState.isFormStateReadOnly : false;

    const { areDiaryNotesViewed } = useContext(DiaryNotesContext);

    const formParts = getFormParts(caseType, clientCode, qualType, docType);
    const [taskApiError, setTaskApiError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const carrier = clientCode.toUpperCase();
    const carrierMappedText = CarrierToCarrierTitleMap[carrier];
    const carrierTitle = carrierMappedText ? carrierMappedText : carrier;

    const formTitle = caseType ? t(`formTitles.${caseType.toLowerCase()}`, { carrier: carrierTitle }) : t(`formTitles.defaultTitle`);

    if (!formParts) {
        console.error(`form-entry::${caseType}::No form parts found`, {
            documentNumber: document?.documentNumber,
            clientCode,
            contract: document?.contract,
            isNonProdEnv: isNonProductionEnvironment(),
        });
        router.push(`/create-case/error?errorCode=${ERROR_CODES.WITHDRAWAL_FORM_CREATION}`);
    }


    const validateForm = () => {
        const {
            formValidator,
            setFormErrors,
            initialForm: {
                data: { formRequest },
            },
            formData,
            formDisbursement,
            formDistribution,
            formFullSurrenderAck,
            formIrsData,
            formLoan,
            formParty,
            formProgram,
            formRestriction,
            formSignature,
            formSource,
            formTaxWithholding,
            formTpaAuthorization,
            formSurrenderingCompany,
            formAdditionalWaivers,
        } = formState;
        const errors = formValidator({
            formData,
            formDisbursement,
            formDistribution,
            formFullSurrenderAck,
            formIrsData,
            formLoan,
            formParty,
            formProgram,
            formRestriction,
            formSignature,
            formSource,
            formSpecialInstruction: formRequest.formSpecialInstruction,
            formTaxWithholding,
            formTaxIdCertificate: formRequest.formTaxIdCertificate,
            formTpaAuthorization,
            formSurrenderingCompany,
            formAdditionalWaivers,
        });
        setFormErrors({ ...errors });
        return Object.keys(errors).length === 0;
    };

    const handleFormSubmit = async () => {
        setIsLoading(true);
        setTaskApiError('');
        if (validateForm() && areDiaryNotesViewed) {
            setIsLoading(false);
            goToNext();
        } else {
            setIsLoading(false);
        }
    };

    return (
        <WorkflowCard
            title={formTitle}
            footerContent={
                <TransactionNavigationButtons
                    className="mt-4"
                    handleContinue={handleFormSubmit}
                    parentPage={ParentPage.CreateCase}
                    leaveTransactionLink='/create-case'
                />
            }
        >
            <>
                {isLoading && (
                    <div className="fixed left-0 top-0 z-10 flex h-screen w-screen justify-center bg-gray-800 opacity-80">
                        <Loader />
                    </div>
                )}
                {formParts}
                <FormErrors taskApiError={taskApiError}></FormErrors>
                <div className="my-2">
                {!areDiaryNotesViewed && !isFormStateReadOnly && (
                    <AssistiveText
                        text={withdrawalTxt('formValidation.diaryNotesViewWarning')}
                        variant={AssistiveTextVariant.Error}
                        className="mt-2"
                    />
                )}
            </div>
            </>

        </WorkflowCard>
    );
}

export default FormEntryStep;