import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import AssistiveText, { AssistiveTextVariant } from '@deps/components/assistive-text/assistive-text';
import CardCaseDocument from '@deps/components/card/card-case-document/card-case-document';
import { CaseDocumentOption, PROCESS_WITHOUT_CASE_DOCUMENT } from '@deps/components/case-document-select/case-document-select';
import Label, { LabelVariant } from '@deps/components/label/label';
import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { getCaseIdentifierValue } from '@deps/helpers/case-management';
import { CaseIdentifier, Processes, Statuses } from '@deps/models/case/case';
import { Policy } from '@deps/models/policy/sor-policy';
import { getCases } from '@deps/queries/api/cases';
import { TransactionClickProps } from '@deps/types/segment-analytics';
import { browserLogError } from '@deps/utils/browser-logging';

import WorkflowCard from '../workflow-card/workflow-card';

export interface StartType {
    caseId?: string;
    businessKey?: string;
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
}: StartStepProps) => {
    const { t } = useTranslation();
    const { goToNext } = useWorkflow();

    const { policyNumber, product } = policy;
    const [selectedCaseId, setSelectedCaseId] = useState<string | undefined>(state.caseId);
    const [showSelectionError, setShowSelectionError] = useState<boolean>(false);
    const [caseOptions, setCaseOptions] = useState<CaseDocumentOption[]>([]);

    useEffect(() => {
        async function populateCaseSelect() {
            const noDocument = {
                documentNumber: t('workflows.start.processWithoutDocument'),
                caseId: '',
                value: PROCESS_WITHOUT_CASE_DOCUMENT,
            };
            const response = await getCases({
                limit: 25,
                notInCaseStatus: [Statuses.Canceled, Statuses.Completed],
                policyNumber: policyNumber,
                process: [processType],
            });

            if (response && 'total' in response) {
                const mappedCaseOptions: CaseDocumentOption[] = response.data.map(caseDetails => {
                    const documentNumber = getCaseIdentifierValue(caseDetails.identifiers, CaseIdentifier.DocumentNumber);
                    return {
                        documentNumber: documentNumber || '',
                        caseId: caseDetails.id,
                        tag: `${caseDetails?.process || ''} - ${caseDetails?.processSubType || ''}`,
                        value: caseDetails.id,
                    };
                });
                setCaseOptions([...mappedCaseOptions, noDocument]);
            } else {
                setCaseOptions([noDocument]);
                browserLogError(response?.data?.err ? response.data.err : 'Error fetching cases');
            }
        }

        populateCaseSelect();
    }, [policyNumber, t]);

    const handleSelection = (caseId: string, documentNumber: string) => {
        if (selectedCaseId === caseId) {
            setState(prevState => ({
                ...prevState,
                caseId: undefined,
                businessKey: undefined,
            }));

            setSelectedCaseId(undefined);
        } else {
            setState(prevState => ({
                ...prevState,
                caseId,
                businessKey: documentNumber,
            }));

            setSelectedCaseId(caseId);
        }
        setShowSelectionError(false);
    };

    const handleContinue = async () => {
        const selectedOption = caseOptions.find(option => option.value === selectedCaseId);
        if (!selectedOption) {
            setShowSelectionError(true);
            return;
        }

        setShowSelectionError(false);
        goToNext();
    };

    return (
        <WorkflowCard
            title={title}
            subtitle={subtitle}
            footerContent={
                <TransactionNavigationButtons
                    handleContinue={handleContinue}
                    planCode={product?.planCode}
                    policyNumber={policyNumber}
                    parentPage={parentPage}
                    disableContinue={isContinueDisabled}
                    trackEventProps={trackEventProps}
                />
            }
        >
            <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                    <Label
                        className="mb-4"
                        label={t('workflows.start.documentSelectionLabel')}
                        sentenceCase={false}
                        variant={LabelVariant.LabelLg}
                    />
                    <div className="grid max-w-[436px] gap-2">
                        {caseOptions.map(option => (
                            <CardCaseDocument
                                caseDocumentOption={option}
                                isSelected={state.caseId === option.value}
                                key={option.value}
                                onChange={() => handleSelection(option.value as string, option.documentNumber as string)}
                            />
                        ))}
                    </div>
                    {(selectedCaseId === PROCESS_WITHOUT_CASE_DOCUMENT || showSelectionError) && (
                        <div className="flex flex-col gap-2 mt-2">
                            {selectedCaseId === PROCESS_WITHOUT_CASE_DOCUMENT && (
                                <AssistiveText
                                    variant={AssistiveTextVariant.Info}
                                    text={
                                        isOnBaseUpdateAssistiveText
                                            ? t('workflows.start.processWithoutDocAssistiveTextWithOnBaseUpdate')
                                            : t('workflows.start.processWithoutDocAssistiveText')
                                    }
                                />
                            )}
                            {showSelectionError && (
                                <AssistiveText variant={AssistiveTextVariant.Error} text={t('workflows.start.missingSelection')} />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </WorkflowCard>
    );
};

export default StartStep;
