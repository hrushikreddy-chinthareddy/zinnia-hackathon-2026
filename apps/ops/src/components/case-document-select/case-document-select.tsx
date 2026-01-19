import { TFunction, useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useEffect, useId } from 'react';
import { v4 as uuidV4 } from 'uuid';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import CardCaseDocument from '@deps/components/card/card-case-document/card-case-document';
import Label, { LabelVariant } from '@deps/components/label/label';
import { ViewState } from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/states/states.helpers';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { getCaseIdentifierValue } from '@deps/helpers/case-management';
import { CaseIdentifier, Processes, Statuses } from '@deps/models/case/case';
import { NonFinancialTransactionBody } from '@deps/queries/api/bpm-non-financial';
import { getCases } from '@deps/queries/api/cases';
import { browserLogError } from '@deps/utils/browser-logging';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';

export const PROCESS_WITHOUT_CASE_DOCUMENT = '';

type CaseId = { caseId?: string; correlationId?: string } | undefined;
export type SetStateCaseId = Dispatch<SetStateAction<CaseId>>;
type SetStateCaseDocumentOptions = Dispatch<
    SetStateAction<CaseDocumentOption[]>
>;
type SetStateViewState = Dispatch<SetStateAction<ViewState>>;

export interface CaseDocumentSelectProps {
    caseId?: string;
    caseDocumentOptions: CaseDocumentOption[];
    currentErrors?: CaseId;
    policyNumber?: string;
    processType: Processes;
    setBody: SetStateCaseId;
    setCaseDocumentOptions: SetStateCaseDocumentOptions;
    setCurrentErrors: SetStateCaseId;
    setViewState: SetStateViewState;
    required?: boolean;
    processSubType?: Processes[];
    correlationId?: string;
    body?: NonFinancialTransactionBody;
}

export interface CaseDocumentOption {
    documentNumber?: string;
    caseId: string;
    tag?: string;
    value: string;
    correlationId?: string;
}

interface GetAssistiveText {
    caseId?: string;
    currentErrors?: CaseId;
    t: TFunction;
}

interface GetCaseDocumentOptions {
    policyNumber?: string;
    processType: Processes;
    setCaseDocumentOptions: SetStateCaseDocumentOptions;
    setViewState: SetStateViewState;
    t: TFunction;
    featureFlags: FeatureFlags;
    processSubType?: Processes[];
    correlationId?: string;
    setBody?: SetStateCaseId;
}

const getAssistiveText = ({ caseId, currentErrors, t }: GetAssistiveText) => {
    if (caseId === PROCESS_WITHOUT_CASE_DOCUMENT) {
        return {
            text: t('transactions.caseDocumentSelect.noDocumentAssistiveText'),
            variant: AssistiveTextVariant.Info,
        };
    }

    if (currentErrors?.caseId) {
        return {
            text: currentErrors.caseId,
            variant: AssistiveTextVariant.Error,
        };
    }

    if (caseId) {
        return {
            text: t(
                'transactions.caseDocumentSelect.caseSelectionAssistiveText'
            ),
            variant: AssistiveTextVariant.Info,
        };
    }

    return null;
};

const getCaseDocumentOptions = async ({
    policyNumber,
    processType,
    setCaseDocumentOptions: setCaseDocumentOptions,
    setViewState,
    t,
    featureFlags,
    processSubType,
    correlationId,
    setBody,
}: GetCaseDocumentOptions) => {
    if (!policyNumber) return;

    setViewState(ViewState.Loading);

    const noDocument = {
        documentNumber: t(
            'transactions.caseDocumentSelect.processWithoutDocument'
        ),
        caseId: '',
        value: PROCESS_WITHOUT_CASE_DOCUMENT,
    };

    const response = await getCases(
        {
            limit: 25,
            notInCaseStatus: [Statuses.Canceled, Statuses.Completed],
            policyNumber,
            process: [processType],
            requestSubType: processSubType,
        },
        featureFlags
    );

    if (response && 'total' in response) {
        const mappedCaseOptions = response.data
            .map((caseItem) => {
                const documentNumber = getCaseIdentifierValue(
                    caseItem.identifiers,
                    CaseIdentifier.DocumentNumber
                );
                return {
                    documentNumber: documentNumber || '',
                    caseId: caseItem.id,
                    tag: `${caseItem.process} - ${caseItem.processSubType}`,
                    value: caseItem.id,
                    correlationId: caseItem.correlationId,
                };
            })
            .filter(Boolean) as CaseDocumentOption[];

        const selectedDefaultCase =
            correlationId &&
            mappedCaseOptions.find(
                (option) => option.correlationId === correlationId
            );
        if (selectedDefaultCase && setBody) {
            setBody((prevState) => ({
                ...prevState,
                caseId: selectedDefaultCase.caseId,
                correlationId: selectedDefaultCase.correlationId,
            }));
        }

        setCaseDocumentOptions([...mappedCaseOptions, noDocument]);
        setViewState(ViewState.Default);
    } else {
        setCaseDocumentOptions([noDocument]);
        setViewState(ViewState.Default);

        browserLogError(
            response?.data?.err ? response.data.err : 'Error fetching cases'
        );
    }
};

const CaseDocumentSelect = ({
    caseId,
    caseDocumentOptions,
    currentErrors,
    policyNumber,
    processType,
    setBody,
    setCaseDocumentOptions,
    setCurrentErrors,
    setViewState,
    required = false,
    processSubType,
    correlationId,
    body,
}: CaseDocumentSelectProps) => {
    const { t } = useTranslation();
    const { featureFlags } = useOptimizely();
    const assistiveText = getAssistiveText({ caseId, currentErrors, t });
    const errorMessageId = useId();
    const hasError = !!currentErrors?.caseId;

    useEffect(() => {
        if (caseDocumentOptions?.length) {
            return;
        } else {
            getCaseDocumentOptions({
                policyNumber,
                processType,
                setCaseDocumentOptions,
                setViewState,
                t,
                featureFlags,
                processSubType,
                correlationId,
                setBody,
            });
        }
    }, [
        caseDocumentOptions,
        featureFlags,
        policyNumber,
        processType,
        setCaseDocumentOptions,
        setViewState,
        t,
        processSubType,
    ]);

    return (
        <fieldset
            className={`flex flex-col gap-2 ${
                hasError ? 'case-document-error' : ''
            }`}
            data-error-id="caseId"
            role="radiogroup"
            aria-invalid={hasError ? true : undefined}
            aria-describedby={hasError ? errorMessageId : undefined}
            tabIndex={hasError ? -1 : undefined}
        >
            <legend className="flex items-center gap-1">
                <Label
                    label={t('transactions.caseDocumentSelect.label')}
                    sentenceCase={false}
                    variant={LabelVariant.LabelLg}
                />
                {required && (
                    <span className="text-semantic-error">&nbsp;*</span>
                )}
            </legend>

            <div
                className={`flex flex-col gap-2 ${
                    correlationId && body?.correlationId == correlationId
                        ? 'opacity-50 pointer-events-none'
                        : ''
                }`}
            >
                {caseDocumentOptions.map((caseDocumentOption, index) => (
                    <CardCaseDocument
                        caseDocumentOption={caseDocumentOption}
                        key={caseDocumentOption.value}
                        isSelected={caseId === caseDocumentOption.value}
                        index={index}
                        hasError={hasError}
                        onChange={(value: string) => {
                            setCurrentErrors((prevState) => {
                                const { caseId, ...errors } = prevState ?? {};
                                return errors;
                            });
                            setBody((prevState) => ({
                                ...prevState,
                                caseId: value,
                                correlationId:
                                    caseDocumentOption.correlationId ||
                                    uuidV4(),
                            }));
                        }}
                    />
                ))}

                {assistiveText && (
                    <AssistiveText
                        id={hasError ? errorMessageId : undefined}
                        text={assistiveText.text}
                        variant={assistiveText.variant}
                    />
                )}
            </div>
        </fieldset>
    );
};

export default CaseDocumentSelect;
