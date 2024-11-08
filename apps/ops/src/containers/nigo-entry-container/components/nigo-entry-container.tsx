import { useTranslation } from 'next-i18next';
import { useEffect, useMemo } from 'react';

import { TranslationFiles } from '@deps/config/translations';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import { DocumentData } from '@deps/models/case/document';
import { AvailableFormsTransaction } from '@deps/models/case/send-document';
import { Policy } from '@deps/models/policy/sor-policy';
import { TransactionDetails } from '@deps/pages/nigo-entry';
import { getTransactionSubTypes, searchForms } from '@deps/queries/api/c2web';

import { useNigoEntry } from './nigo-entry-provider';
import ConfirmStep from './steps/confirm/confirm-step';
import FormEntryStep from './steps/form-entry/form-entry-step';
import FormSelectionStep from './steps/form-selection.tsx/form-selection-step';
import { NigoDetailsStep } from './steps/nigo-details/nigo-details-step';
import { ServiceFormReviewStep } from './steps/service-form-review/service-form-review-step';
import TabGroupContainer from './tab-group-container';

interface NigoEntryContainerContainerProps {
    policy: Policy;
    availableFormsTransactions: AvailableFormsTransaction[];
    planCode: string;
    documentNumber: string;
    docType: string;
    clientCode: string;
    nigoExceptions: any;
    nigoSubExceptions: any;
    documentData: DocumentData;
    taskInfoLink: string;
    prevTransactionDetails: TransactionDetails | null;

}

const NigoEntryContainer = ({
    documentData,
    documentNumber,
    policy,
    availableFormsTransactions,
    docType,
    clientCode,
    nigoExceptions,
    nigoSubExceptions,
    taskInfoLink,
    prevTransactionDetails,
}: NigoEntryContainerContainerProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'nigoEntry' });
    const { setTransactionType, setTransactionSubType, setDocument, isReadyForDataEntry } = useNigoEntry();

    const transactionOptions = useMemo(() => {
        return availableFormsTransactions?.map(transaction => {
            return { label: transaction.name, value: transaction.id };
        });
    }, [availableFormsTransactions]);

    useEffect(() => {
        const initialize = async () => {
            if (prevTransactionDetails) {
                const transType = prevTransactionDetails?.requestSubType.replace(/ /g, '_').toUpperCase();
                const formName = prevTransactionDetails?.formName;
                setTransactionType({ selected: transType, list: transactionOptions });
                try {
                    const response = await getTransactionSubTypes(transType);
                    const transSubType =
                        response?.find(transaction => transaction.name === prevTransactionDetails?.transactionSubType || '')?.id || '';

                    if (response) {
                        const options = response.map(transaction => {
                            return { label: transaction.name, value: transaction.id };
                        });
                        setTransactionSubType({ selected: transSubType, list: options });

                        const formSearchRequestBody = {
                            contractNumber: policy.policyNumber ?? '',
                            planCode: policy.product?.planCode ?? '',
                            transactionType: transType,
                            transactionSubType: transSubType,
                            carrier: policy?.carrierId ?? '',
                            issueState: policy.issueState ?? '',
                            ctiCallNumber: '',
                        };
                        const searchResponse = await searchForms(formSearchRequestBody);
                        const selectedForm = searchResponse?.find(form => form.formDisplayName === formName);
                        if (searchResponse) {
                            setDocument({ list: searchResponse, selected: selectedForm || null });
                        }
                    }
                } catch (e: any) {
                    console.error('GetTransactionSubTypes::Error retrieving transaction sub types', e);
                }
            }
        };
        if (prevTransactionDetails) {
            initialize();
        }
    }, [
        policy?.carrierId,
        policy.issueState,
        policy.policyNumber,
        policy.product?.planCode,
        prevTransactionDetails,
        setDocument,
        setTransactionSubType,
        setTransactionType,
        availableFormsTransactions,
        transactionOptions,
    ]);

    const steps = useMemo(
        () => [
            {
                ariaLabel: t('tabs.serviceFormReview'),
                isVisible: () => true,
                component: (
                    <ServiceFormReviewStep
                        policy={policy}
                        documentNumber={documentNumber}
                        docType={docType}
                        clientCode={clientCode}
                        taskInfoLink={taskInfoLink}
                        document={documentData}
                    />
                ),
                screenReaderLabel: t('tabs.serviceFormReview'),
                index: 0,
                text: t('tabs.serviceFormReview'),
            },
            {
                ariaLabel: t('tabs.formEntry'),
                isVisible: () => isReadyForDataEntry,
                component: <FormEntryStep document={documentData} clientCode={clientCode} docType={docType} />,
                screenReaderLabel: t('tabs.formEntry'),
                index: 1,
                text: t('tabs.formEntry'),
            },
            {
                ariaLabel: t('tabs.nigoDetails'),
                isVisible: () => !isReadyForDataEntry,
                component: <NigoDetailsStep nigoExceptions={nigoExceptions} nigoSubExceptions={nigoSubExceptions} />,
                screenReaderLabel: t('tabs.nigoDetails'),
                index: 1,
                text: t('tabs.nigoDetails'),
            },
            {
                ariaLabel: t('tabs.documentSelection'),
                isVisible: () => !isReadyForDataEntry,
                component: <FormSelectionStep availableFormsTransactions={availableFormsTransactions} policy={policy} documentData={documentData}/>,
                screenReaderLabel: t('tabs.documentSelection'),
                index: 2,
                text: t('tabs.documentSelection'),
            },
            {
                ariaLabel: t('tabs.confirm'),
                isVisible: () => true,
                component: <ConfirmStep documentNumber={documentNumber} docType={docType} clientCode={clientCode} document={documentData} />,
                screenReaderLabel: t('tabs.confirm'),
                index: 3,
                text: t('tabs.confirm'),
            },
        ],
        [availableFormsTransactions, clientCode, docType, documentData, documentNumber, isReadyForDataEntry, nigoExceptions, nigoSubExceptions, policy, t, taskInfoLink]
    );

    const filteredSteps: Step[] = useMemo(
        () => steps.filter((item: any) => item.isVisible?.()).map((item: any, index: number) => ({ ...item, index })),
        [steps]
    );

    return <TabGroupContainer steps={filteredSteps} policy={policy} documentNumber={documentNumber} docType={docType} documentData={documentData}></TabGroupContainer>;
};

export default NigoEntryContainer;
