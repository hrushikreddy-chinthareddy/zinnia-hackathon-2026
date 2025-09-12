import { useUser } from '@auth0/nextjs-auth0/client';
import {
    AssistiveText,
    AssistiveTextVariant,
    Loader,
} from '@zinnia/bloom/components';
import { DEFAULT_DATE_FORMAT } from '@zinnia/utils';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback, useContext, useState } from 'react';

import 'react-pdf/dist/Page/TextLayer.css';

import NoteSection from '@deps/components/otp-withdrawal-form/note-section';
import TransactionNavigationButtons, {
    ParentPage,
} from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { CarrierToCarrierTitleMap } from '@deps/constants/page-title';
import { OWNER_TYPES } from '@deps/containers/otp/renewal-forms/components/renewal-form-helpers';
import { FormErrors } from '@deps/containers/otp/withdrawal-forms/components/form-errors';
import { buildFormV2 } from '@deps/containers/otp/withdrawal-forms/utils/withdrawal-form-helpers';
import { DiaryNotesContext } from '@deps/contexts/DiaryNotesContext';
import { RenewalFormDataContext } from '@deps/contexts/OtpRenewalFormContext';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { useContractAccountInfo } from '@deps/hooks/otp-withdrawal/useContractAccountInfo';
import { CaseType } from '@deps/models/case/case';
import { DocumentData, PolicyDocument } from '@deps/models/case/document';
import { ApiVersion } from '@deps/models/case/enums';
import { TaskApiVersionMapper } from '@deps/models/case/helpers';
import { Channel } from '@deps/models/case/renewal/case-renewal';
import { TaskSource, OwnerInformation } from '@deps/models/case/task';
import { TaskStatus } from '@deps/models/case/task-instance';
import { ERROR_CODES } from '@deps/pages/create-case/error';
import { updateTask } from '@deps/queries/api/v2/task';
import {
    DEFAULT_EXTENDED_DAY_DATE_FORMAT,
    DEFAULT_EXTENDED_MONTH_DATE_FORMAT,
    DEFAULT_EXTENDED_DATE_FORMAT,
    ZAHARA_API_DATE_FORMAT,
} from '@deps/types/constants';
import { isNonProductionEnvironment } from '@deps/utils/environment.helpers';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import { getCaseType, getFormParts } from './form-entry-step.helpers';
import { useNigoEntry } from '../../nigo-entry-provider';
import { useGetPolicyTypeDocs } from '../service-form-review/service-form-review.helpers';

type FormEntryStepProps = {
    document: DocumentData;
    clientCode: string;
    docType: string;
    planCode: string;
};

function FormEntryStep({
    document,
    clientCode,
    docType,
    planCode,
}: FormEntryStepProps) {
    const router = useRouter();
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'nigoEntry.formEntry',
    });
    const { t: withdrawalTxt } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request',
    });
    const { goToNext } = useWorkflow();

    //const { qualType } = useAccountInfo(document.contract, clientCode);
    const { user } = useUser();
    const caseType = getCaseType(docType as string);
    const formState = useContext(FormDataContext);
    const {
        channel,
        renewalRequestSignDate,
        subsequentTargetFunds,
        formValidator: renewalFormValidator,
        setFormErrors: renewalSetFormErrors,
        ownerInformation,
        transOption,
        document: renewalDocument,
        initialForm: renewalInitialForm,
        contractValue,
    } = useContext(RenewalFormDataContext);
    const { areDiaryNotesViewed } = useContext(DiaryNotesContext);
    const shouldShowNewExperience =
        formState.featureFlagDecisions?.[FEATURE_FLAGS.NEW_EXP];
    const isFormStateReadOnly = shouldShowNewExperience
        ? formState.isFormStateReadOnly
        : false;
    const [timer] = useState(performance.now());

    const { setSubmitFailed, initRelatedDocCount, areAttachmentsViewed } =
        useNigoEntry();
    const contractAccountInfo = useContractAccountInfo(
        document.contract,
        planCode as string,
        clientCode as string,
        formState.isLC ?? false
    );
    const { qualType } = contractAccountInfo;

    const formParts = getFormParts(
        caseType,
        clientCode,
        qualType,
        planCode,
        formState.isLC ?? false
    );
    const [taskApiError, setTaskApiError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const carrier = clientCode?.toUpperCase();
    const carrierMappedText = CarrierToCarrierTitleMap[carrier];
    const carrierTitle = carrierMappedText ? carrierMappedText : carrier;

    const formTitle = caseType
        ? t(`formTitles.${caseType.toLowerCase()}`, { carrier: carrierTitle })
        : t(`formTitles.defaultTitle`);

    if (!formParts) {
        console.error(`form-entry::${caseType}::No form parts found`, {
            documentNumber: document?.documentNumber,
            clientCode,
            contract: document?.contract,
            isNonProdEnv: isNonProductionEnvironment(),
        });
        router.push(
            `/create-case/error?errorCode=${ERROR_CODES.WITHDRAWAL_FORM_CREATION}`
        );
    }

    const validateOTPForm = () => {
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

    const validateRenewalForm = () => {
        const errors = renewalFormValidator({
            ownerInformation,
            subsequentTargetFunds,
            renewalRequestSignDate,
            channel,
        });

        renewalSetFormErrors({ ...errors });
        return Object.keys(errors).length === 0; // Returns true if no error
    };

    const validateForm = () => {
        if (caseType === CaseType.Renewal) {
            return validateRenewalForm();
        } else {
            return validateOTPForm();
        }
    };

    const getRenewalFormDataPayload = (
        ownerInfo: OwnerInformation[],
        contractVal: string | number | null,
        transactionOption: string | null,
        email: string,
        renewalDoc: DocumentData,
        obPendTaskId: string | null
    ) => {
        const updatedOwnerInformation = ownerInfo?.map((owner) => {
            if (OWNER_TYPES.includes(owner.type)) {
                return {
                    ...owner,
                    signature: {
                        ...owner?.signature,
                        ...(channel === Channel.Phone && {
                            signDate: renewalRequestSignDate,
                        }), // CMW-13965 updaing Call Received Date in signDate
                    },
                };
            }
            return owner;
        });

        const funds = subsequentTargetFunds?.map((item) => {
            return {
                fundName: item.fundName,
                value: item.value,
                fundCode: item?.fundCode,
                divisionCode: item?.divisionCode,
            };
        });

        return {
            channel,
            clientCode: clientCode.toUpperCase(),
            contractNum: renewalDoc?.contract,
            documentNumber: renewalDoc?.documentNumber,
            contractValue: typeof contractVal === 'string' ? null : contractVal,
            documentReceivedDate: dayjs(renewalDoc?.documentDate, [
                DEFAULT_DATE_FORMAT,
                DEFAULT_EXTENDED_DAY_DATE_FORMAT,
                DEFAULT_EXTENDED_MONTH_DATE_FORMAT,
                DEFAULT_EXTENDED_DATE_FORMAT,
            ]).format(ZAHARA_API_DATE_FORMAT),
            goodOrderDate: dayjs().format(ZAHARA_API_DATE_FORMAT),
            lob: renewalDoc?.lob,
            onbaseCaseId: renewalDoc?.caseId,
            obPendTaskId: obPendTaskId || null,
            ownerInformation: updatedOwnerInformation,
            productName: renewalDoc?.productName,
            renewalRequestSignDate, // need to handle it for FormType
            source: 'SupportTool',
            subsequentGuaranteePeriod: null,
            subsequentTargetFunds: funds || null,
            taskType: 'RenewalTransfer',
            transOption: transactionOption,
            userId: email ?? '',
        };
    };

    const [, getPolicyDocs, , relatedDocument] = useGetPolicyTypeDocs(
        document.contract,
        clientCode,
        docType,
        document
    );

    const filteredRelatedDocument: PolicyDocument[] = relatedDocument?.filter(
        (item: PolicyDocument) =>
            item.documentNumber !== document?.documentNumber
    );

    const submit = useCallback(async () => {
        setIsLoading(true);
        if (caseType === CaseType.Renewal) {
            if (renewalInitialForm.status !== TaskStatus.Completed) {
                const payload = {
                    source: TaskSource.ZinniaTaskManagement,
                    taskType: renewalInitialForm.taskType,
                    status: TaskStatus.Completed,
                    data: getRenewalFormDataPayload(
                        ownerInformation,
                        contractValue,
                        transOption,
                        user?.email ?? '',
                        renewalDocument,
                        renewalInitialForm?.data?.obPendTaskId || null
                    ),
                };
                const successfulCaseUpdate = await updateTask(
                    renewalInitialForm.caseId,
                    renewalInitialForm.taskId,
                    payload,
                    timer
                );
                if (successfulCaseUpdate && successfulCaseUpdate.id) {
                    setSubmitFailed(false);
                } else {
                    setSubmitFailed(true);
                }
            } else {
                setSubmitFailed(false);
            }
        } else {
            if (
                TaskApiVersionMapper[formState.initialForm.taskType] ===
                    ApiVersion.v2 &&
                formState.initialForm.status !== TaskStatus.Completed
            ) {
                const successfulCaseUpdate = await updateTask(
                    formState.initialForm.caseId,
                    formState.initialForm.taskId,
                    buildFormV2(TaskStatus.Completed, document, formState),
                    timer
                );

                if (successfulCaseUpdate && successfulCaseUpdate.id) {
                    setSubmitFailed(false);
                } else {
                    setSubmitFailed(true);
                }
            } else {
                setSubmitFailed(false);
            }
        }

        setIsLoading(false);
    }, [
        caseType,
        renewalInitialForm.status,
        renewalInitialForm.taskType,
        renewalInitialForm?.data?.obPendTaskId,
        getRenewalFormDataPayload,
        ownerInformation,
        contractValue,
        transOption,
        user?.email,
        renewalDocument,
        timer,
        setSubmitFailed,
        formState,
        document,
    ]);

    const handleFormSubmit = async () => {
        getPolicyDocs();
        setIsLoading(true);
        setTaskApiError('');
        const checkAttachmentsViewed =
            filteredRelatedDocument?.length === initRelatedDocCount ||
            areAttachmentsViewed;
        if (validateForm() && areDiaryNotesViewed && checkAttachmentsViewed) {
            setIsLoading(false);
            await submit();
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
                    leaveTransactionLink="/create-case"
                    disableContinue={
                        formState.initialForm?.status ===
                            TaskStatus.Completed ||
                        renewalInitialForm.status === TaskStatus.Completed
                    }
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
                {caseType !== CaseType.Renewal && <NoteSection />}
                <FormErrors
                    t={withdrawalTxt}
                    taskApiError={taskApiError}
                ></FormErrors>
                <div className="my-2">
                    {!areDiaryNotesViewed && !isFormStateReadOnly && (
                        <AssistiveText
                            text={withdrawalTxt(
                                'formValidation.diaryNotesViewWarning'
                            )}
                            variant={AssistiveTextVariant.Error}
                            className="mt-2"
                        />
                    )}
                    {filteredRelatedDocument &&
                        filteredRelatedDocument?.length !==
                            initRelatedDocCount && (
                            <AssistiveText
                                text={withdrawalTxt(
                                    'formValidation.attachmentsViewWarning'
                                )}
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
