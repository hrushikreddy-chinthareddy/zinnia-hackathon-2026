import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import CardCaseDocument from '@deps/components/card/card-case-document/card-case-document';
import {
    CaseDocumentOption,
    PROCESS_WITHOUT_CASE_DOCUMENT,
} from '@deps/components/case-document-select/case-document-select';
import Label, { LabelVariant } from '@deps/components/label/label';
import TransactionNavigationButtons, {
    ParentPage,
} from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { SourceType } from '@deps/constants/policy';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { getCaseIdentifierValue } from '@deps/helpers/case-management';
import { CaseIdentifier, Processes, Statuses } from '@deps/models/case/case';
import { ManagementTask } from '@deps/models/case/task-instance';
import { getCases } from '@deps/queries/api/cases';
import { getTaskInstance } from '@deps/queries/api/v2/task';
import { TransactionClickProps } from '@deps/types/segment-analytics';
import { browserLogError } from '@deps/utils/browser-logging';
import { Policy } from '@zinnia/api-types/types/sor';

import DocumentCard from '../document/document-card';
import WorkflowCard from '../workflow-card/workflow-card';

export interface StartType {
    caseId?: string;
    businessKey?: string;
    correlationId?: string;
}

export type StartStepSetState = Dispatch<SetStateAction<StartType>>;

interface StartStepProps extends TransactionClickProps {
    parentPage: ParentPage;
    policy: Policy;
    processType: Processes;
    setState: StartStepSetState;
    state: StartType;
    title: string;
    subtitle?: string;
    isOnBaseUpdateAssistiveText?: boolean;
    isContinueDisabled?: boolean;
    leaveTransactionLink?: string;
    processSubType?: string[];
    type?: SourceType;
    correlationId?: string;
    isFormStateReadOnly?: boolean;
}

const StartStep = ({
    parentPage,
    policy,
    processType,
    setState,
    state,
    title,
    subtitle,
    trackEventProps,
    isOnBaseUpdateAssistiveText = false,
    isContinueDisabled = false,
    leaveTransactionLink,
    processSubType,
    type = SourceType.Document,
    correlationId,
    isFormStateReadOnly = false,
}: StartStepProps) => {
    const { t } = useTranslation();
    const { featureFlags } = useOptimizely();
    const { goToNext } = useWorkflow();

    const { policyNumber, product } = policy;
    const [selectedCaseId, setSelectedCaseId] = useState<string | undefined>(
        state.caseId
    );
    const [showSelectionError, setShowSelectionError] =
        useState<boolean>(false);
    const [caseOptions, setCaseOptions] = useState<CaseDocumentOption[]>([]);
    const router = useRouter();
    const { taskId } = router.query;
    const [task, setTask] = useState<ManagementTask | null>(null);

    useEffect(() => {
        if (!taskId) {
            return;
        }
        const getTaskData = async () => {
            const data = await getTaskInstance({ taskId });
            setTask(data);
        };
        getTaskData();
    }, [taskId]);

    useEffect(() => {
        async function populateCaseSelect() {
            const noDocument = {
                documentNumber:
                    type == SourceType.Case
                        ? t('workflows.start.processWithoutCase')
                        : t('workflows.start.processWithoutDocument'),
                caseId: '',
                value: PROCESS_WITHOUT_CASE_DOCUMENT,
            };

            const basePayload = {
                limit: 25,
                notInCaseStatus: [Statuses.Canceled, Statuses.Completed],
                policyNumber: policyNumber,
                process: [processType],
            };

            const payload =
                processSubType && processSubType.length
                    ? {
                          ...basePayload,
                          requestSubType: processSubType,
                      }
                    : basePayload;

            const response = await getCases(payload, featureFlags);

            if (response && 'total' in response) {
                const mappedCaseOptions: CaseDocumentOption[] =
                    response.data.map((caseDetails) => {
                        const documentNumber = getCaseIdentifierValue(
                            caseDetails.identifiers,
                            CaseIdentifier.DocumentNumber
                        );
                        return {
                            documentNumber: documentNumber || '',
                            caseId: caseDetails.id,
                            tag: caseDetails.processSubType
                                ? `${caseDetails?.process || ''} - ${
                                      caseDetails.processSubType
                                  }`
                                : `${caseDetails?.process || ''}`,
                            value: caseDetails.id,
                            correlationId: caseDetails.correlationId,
                        };
                    });

                const selectedDefaultCase =
                    correlationId &&
                    mappedCaseOptions.find(
                        (option) => option.correlationId === correlationId
                    );

                if (selectedDefaultCase && setState) {
                    setState((prevState) => ({
                        ...prevState,
                        caseId: selectedDefaultCase.caseId,
                        correlationId: selectedDefaultCase.correlationId,
                    }));
                    setSelectedCaseId(selectedDefaultCase.caseId);
                }

                setCaseOptions([...mappedCaseOptions, noDocument]);
            } else {
                setCaseOptions([noDocument]);
                browserLogError(
                    response?.data?.err
                        ? response.data.err
                        : 'Error fetching cases'
                );
            }
        }

        populateCaseSelect();
    }, [policyNumber, t]);

    const handleSelection = (caseId: string, documentNumber: string) => {
        if (selectedCaseId === caseId) {
            setState((prevState) => ({
                ...prevState,
                caseId: undefined,
                businessKey: undefined,
            }));

            setSelectedCaseId(undefined);
        } else {
            setState((prevState) => ({
                ...prevState,
                caseId,
                businessKey: documentNumber,
                correlationId: caseOptions?.find(
                    (option) => option.value === caseId
                )?.correlationId,
            }));

            setSelectedCaseId(caseId);
        }
        setShowSelectionError(false);
    };

    const handleContinue = async () => {
        const selectedOption = caseOptions.find(
            (option) => option.value === selectedCaseId
        );
        if (!selectedOption) {
            setShowSelectionError(true);
            return;
        }
        setShowSelectionError(false);
        goToNext();
    };

    return (
        <>
            {task?.data?.details?.documents?.length && (
                <div className="px-8 pt-8">
                    <Typography
                        variant={TypographyVariant.BodyBold}
                        className="pb-4"
                    >
                        {t('workflows.start.supportingInfo')}
                    </Typography>
                    {taskId?.length &&
                        task?.data.details.documents.map(
                            (doc: {
                                documentId: any;
                                documentName: any;
                                documentExt: any;
                            }) => (
                                <DocumentCard
                                    key={doc.documentId}
                                    cardClass="w-[455px] mb-2"
                                    document={{
                                        documentId: doc.documentId,
                                        documentName: doc.documentName,
                                        displayName: doc.documentName,
                                        documentExt: doc.documentExt,
                                        carrier: task?.carrier ?? '',
                                    }}
                                />
                            )
                        )}
                </div>
            )}

            <WorkflowCard
                title={title}
                subtitle={subtitle}
                footerContent={
                    !isFormStateReadOnly ? (
                        <TransactionNavigationButtons
                            handleContinue={handleContinue}
                            planCode={product?.planCode}
                            policyNumber={policyNumber}
                            parentPage={parentPage}
                            disableContinue={isContinueDisabled}
                            trackEventProps={trackEventProps}
                            leaveTransactionLink={leaveTransactionLink}
                        />
                    ) : undefined
                }
            >
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col">
                        {!isFormStateReadOnly && (
                            <Label
                                className="mb-4"
                                label={
                                    type == 'case'
                                        ? t(
                                              'workflows.start.caseSelectionLabel'
                                          )
                                        : t(
                                              'workflows.start.documentSelectionLabel'
                                          )
                                }
                                sentenceCase={false}
                                variant={LabelVariant.LabelLg}
                            />
                        )}
                        <div
                            className={`grid max-w-[436px] gap-2 ${
                                isFormStateReadOnly
                                    ? 'pointer-events-none'
                                    : correlationId &&
                                      state?.correlationId == correlationId
                                    ? 'opacity-50 pointer-events-none'
                                    : ''
                            }`}
                        >
                            {caseOptions.map((option) => (
                                <CardCaseDocument
                                    caseDocumentOption={option}
                                    index={0}
                                    isSelected={state.caseId === option.value}
                                    key={option.value}
                                    onChange={() =>
                                        handleSelection(
                                            option.value as string,
                                            option.documentNumber as string
                                        )
                                    }
                                />
                            ))}
                        </div>
                        {(selectedCaseId === PROCESS_WITHOUT_CASE_DOCUMENT ||
                            showSelectionError) && (
                            <div className="flex flex-col gap-2 mt-2">
                                {selectedCaseId ===
                                    PROCESS_WITHOUT_CASE_DOCUMENT && (
                                    <AssistiveText
                                        variant={AssistiveTextVariant.Info}
                                        text={
                                            type == 'case'
                                                ? t(
                                                      'workflows.start.processWithoutCaseAssistiveText'
                                                  )
                                                : isOnBaseUpdateAssistiveText
                                                ? t(
                                                      'workflows.start.processWithoutDocAssistiveTextWithOnBaseUpdate'
                                                  )
                                                : t(
                                                      'workflows.start.processWithoutDocAssistiveText'
                                                  )
                                        }
                                    />
                                )}
                                {showSelectionError && (
                                    <AssistiveText
                                        variant={AssistiveTextVariant.Error}
                                        text={
                                            type == SourceType.Case
                                                ? t(
                                                      'workflows.start.missingCaseSelection'
                                                  )
                                                : t(
                                                      'workflows.start.missingSelection'
                                                  )
                                        }
                                    />
                                )}
                            </div>
                        )}
                        {selectedCaseId && !isFormStateReadOnly && (
                            <AssistiveText
                                variant={AssistiveTextVariant.Info}
                                text={t(
                                    'workflows.start.caseSelectionAssistiveText'
                                )}
                            />
                        )}
                    </div>
                </div>
            </WorkflowCard>
        </>
    );
};

export default StartStep;
