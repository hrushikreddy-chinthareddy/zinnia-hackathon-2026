import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';

import 'react-pdf/dist/Page/TextLayer.css';
import { Loader } from '@deps/components/page-loader';
import { useSendDocument } from '@deps/contexts/SendDocumentContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { SendDocumentAction } from '@deps/models/case/send-document';
import { Policy } from '@deps/models/policy/sor-policy';
import { getTransactionSubTypes, searchForms } from '@deps/queries/api/c2web';

import SendDocumentNavigationButtons from './action-components/navigation-buttons';
import SendDocument from './components/document';
import AssistiveText, { AssistiveTextVariant } from '../assistive-text/assistive-text';
import Autocomplete from '../autocomplete/autocomplete';
import { SimpleOption } from '../autocomplete/autocomplete.types';
import { FieldSize } from '../fields/field';
import Typography, { TypographyVariant } from '../typography/typography';
import WorkflowCard from '../workflows/workflow-card/workflow-card';

type FormSelectionProps = {
    policy: Policy;
    ctiCallNumber: string;
    transactionTypes: SimpleOption[];
};

function FormSelection({ transactionTypes, policy, ctiCallNumber }: FormSelectionProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'sendDocument' });
    const { goToNext } = useWorkflow();
    const { state, dispatch } = useSendDocument();
    const [transactionSubTypeOptions, setTransactionSubTypeOptions] = useState<SimpleOption[]>(state?.transactionSubType?.list || []);
    const [error, setError] = useState<string>('');
    const [loader, setLoader] = useState(false);

    const onTransactionTypeChange = (transactionType: string) => {
        dispatch({
            type: SendDocumentAction.TransactionType,
            payload: { ...state?.transactionType, selected: transactionType, list: transactionTypes },
        });
        // handle api call
        const getSubTypes = async (transactionType: string) => {
            if (transactionType !== '') {
                try {
                    const response = await getTransactionSubTypes(transactionType);

                    if (response) {
                        const options = response.map(transaction => {
                            return { label: transaction.name, value: transaction.id };
                        });

                        setTransactionSubTypeOptions(options);
                    }
                } catch (e: any) {
                    console.error('GetTransactionSubTypes::Error retrieving transaction sub types', e);
                }
            }
        };

        getSubTypes(transactionType);
    };

    const onTransactionSubTypeChange = (transactionSubType: string) => {
        setError('');
        const getForms = async (transactionSubType: string) => {
            setLoader(true);
            dispatch({
                type: SendDocumentAction.TransactionSubType,
                payload: { ...state.transactionSubType, selected: transactionSubType, list: transactionSubTypeOptions },
            });
            if (transactionSubType !== '' && state.transactionType.selected !== null) {
                const formSearchRequestBody = {
                    contractNumber: policy.policyNumber || '',
                    planCode: policy.product?.planCode || '',
                    transactionType: state.transactionType.selected,
                    transactionSubType: transactionSubType,
                    carrier: policy?.carrierId || '',
                    issueState: policy.issueState || '',
                    ctiCallNumber: ctiCallNumber,
                };
                try {
                    const response = await searchForms(formSearchRequestBody);
                    response &&
                        dispatch({
                            type: SendDocumentAction.Documents,
                            payload: { ...state.document, list: response, selected: response?.[0] },
                        });
                    setLoader(false);
                } catch (e: any) {
                    setLoader(false);
                    setError(e?.message as string);
                    console.error('GetCallCenterForms::Error call center forms', e);
                }
            }
        };

        getForms(transactionSubType);
    };

    const handleContinue = async () => {
        if (!state.document?.selected?.formId) {
            return setError(t('errors.formId') as string);
        }
        goToNext();
    };

    const handleCancel = () => {
        dispatch({
            type: SendDocumentAction.Reset,
        });
    };

    return (
        <WorkflowCard
            title={t(`tabs.formSelection`)}
            footerContent={<SendDocumentNavigationButtons handleContinue={handleContinue} handleCancel={handleCancel} />}
        >
            <Autocomplete
                className="max-w-xs"
                label={t(`formSelection.transactionType`) as string}
                options={transactionTypes}
                onChange={(val: string) => onTransactionTypeChange(val)}
                size={FieldSize.Small}
                value={state?.transactionType?.selected || ''}
                data-testid="transactionType"
                labelTooltip={t(`formSelection.transactionType`) as string}
                labelTooltipBody={t(`formSelection.transactionType`) as string}
            />
            <Autocomplete
                className="my-4 max-w-xs"
                label={t(`formSelection.transactionSubType`) as string}
                options={transactionSubTypeOptions}
                onChange={(val: string) => onTransactionSubTypeChange(val)}
                size={FieldSize.Small}
                value={state?.transactionSubType?.selected || ''}
                data-testid="transactionSubType"
                labelTooltip={t(`formSelection.transactionSubType`) as string}
                labelTooltipBody={t(`formSelection.transactionSubType`) as string}
            />
            {loader ? (
                <Loader />
            ) : (
                <>
                    {state?.document?.list?.length === 0 ? (
                        <Typography variant={TypographyVariant.FieldLabel} className="mt-4">
                            {t('formSelection.noFormsFound')}
                        </Typography>
                    ) : (
                        <SendDocument documents={state?.document?.list || []} />
                    )}
                </>
            )}
            {error && <AssistiveText text={error} variant={AssistiveTextVariant.Error} className="mt-2" />}
        </WorkflowCard>
    );
}

export default FormSelection;
