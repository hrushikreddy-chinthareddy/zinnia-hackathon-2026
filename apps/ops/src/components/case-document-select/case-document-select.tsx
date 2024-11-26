import { TFunction, useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useEffect } from 'react';

import AssistiveText, { AssistiveTextVariant } from '@deps/components/assistive-text/assistive-text';
import CardCaseDocument from '@deps/components/card/card-case-document/card-case-document';
import Label, { LabelVariant } from '@deps/components/label/label';
import { ViewState } from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/states/states.helpers'
import { getCaseIdentifierValue } from '@deps/helpers/case-management';
import { CaseIdentifier, Processes, Statuses } from '@deps/models/case/case';
import { getCases } from '@deps/queries/api/cases';

export const PROCESS_WITHOUT_CASE_DOCUMENT = '';

type CaseId = { caseId?: string } | undefined;
export type SetStateCaseId = Dispatch<SetStateAction<CaseId>>;
type SetStateCaseDocumentOptions = Dispatch<SetStateAction<CaseDocumentOption[]>>;
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
}

export interface CaseDocumentOption {
    documentNumber: string;
    tag?: string;
    value: string;
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
}

const getAssistiveText = ({ caseId, currentErrors, t }: GetAssistiveText) => {
    if (caseId === PROCESS_WITHOUT_CASE_DOCUMENT) {
        return { text: t('transactions.caseDocumentSelect.noDocumentAssistiveText'), variant: AssistiveTextVariant.Info };
    }

    if (currentErrors?.caseId) {
        return { text: currentErrors.caseId, variant: AssistiveTextVariant.Error };
    }

    return null;
};

const getCaseDocumentOptions = async ({
    policyNumber,
    processType,
    setCaseDocumentOptions: setCaseDocumentOptions,
    setViewState,
    t,
}: GetCaseDocumentOptions) => {
    if (!policyNumber) return;

    setViewState(ViewState.Loading);

    const noDocument = {
        documentNumber: t('transactions.caseDocumentSelect.processWithoutDocument'),
        value: PROCESS_WITHOUT_CASE_DOCUMENT,
    };

    const response = await getCases({
        limit: 25,
        notInCaseStatus: [Statuses.Canceled, Statuses.Completed],
        policyNumber,
        process: [processType],
    });

    if (response && 'total' in response) {
        const mappedCaseOptions = response.data
            .map(caseItem => {
                const documentNumber = getCaseIdentifierValue(caseItem.identifiers, CaseIdentifier.DocumentNumber);
                if (!documentNumber) return;
                return {
                    documentNumber,
                    tag: caseItem.processSubType ?? caseItem.process,
                    value: caseItem.id,
                };
            })
            .filter(Boolean) as CaseDocumentOption[];

        setCaseDocumentOptions([...mappedCaseOptions, noDocument]);
        setViewState(ViewState.Default);
    } else {
        setCaseDocumentOptions([noDocument]);
        setViewState(ViewState.Default);

        throw new Error(response?.data?.err ? response.data.err : 'Error fetching cases');
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
}: CaseDocumentSelectProps) => {
    const { t } = useTranslation();

    const assistiveText = getAssistiveText({ caseId, currentErrors, t });

    useEffect(() => {
        if (caseDocumentOptions?.length) {
            return;
        } else {
            getCaseDocumentOptions({ policyNumber, processType, setCaseDocumentOptions, setViewState, t });
        }
    }, [caseDocumentOptions, policyNumber, processType, setCaseDocumentOptions, setViewState, t]);

    return (
        <div className="flex flex-col gap-2">
            <Label label={t('transactions.caseDocumentSelect.label')} sentenceCase={false} variant={LabelVariant.FieldLabel} />
            <div className="flex flex-col gap-2">
                {caseDocumentOptions.map(caseDocumentOption => (
                    <CardCaseDocument
                        caseDocumentOption={caseDocumentOption}
                        key={caseDocumentOption.value}
                        isSelected={caseId === caseDocumentOption.value}
                        onChange={(value: string) => {
                            setCurrentErrors(prevState => {
                                const { caseId, ...errors } = prevState ?? {};
                                return errors;
                            });
                            setBody(prevState => ({
                                ...prevState,
                                caseId: value,
                            }));
                        }}
                    />
                ))}

                {assistiveText && <AssistiveText text={assistiveText.text} variant={assistiveText.variant} />}
            </div>
        </div>
    );
};

export default CaseDocumentSelect;
