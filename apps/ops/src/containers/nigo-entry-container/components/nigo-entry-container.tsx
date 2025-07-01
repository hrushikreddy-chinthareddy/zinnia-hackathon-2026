import { Policy } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';

import { TranslationFiles } from '@deps/config/translations';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { AdditionalDataInstance } from '@deps/models/case/additional-data-instance';
import { Processes } from '@deps/models/case/case';
import { DocumentData } from '@deps/models/case/document';
import {
    AvailableFormsTransaction,
    SearchTransactionRequestBody,
} from '@deps/models/case/send-document';
import {
    getSearchTransactions,
    getTransactionSubTypes,
    searchForms,
} from '@deps/queries/api/c2web';
import { getCases } from '@deps/queries/api/cases';
import { fetchPolicy } from '@deps/queries/api/policies';
import { browserLogInfo } from '@deps/utils/browser-logging';

import { useNigoEntry } from './nigo-entry-provider';
import ConfirmStep from './steps/confirm/confirm-step';
import FormEntryStep from './steps/form-entry/form-entry-step';
import FormSelectionStep from './steps/form-selection.tsx/form-selection-step';
import { NigoDetailsStep } from './steps/nigo-details/nigo-details-step';
import { SelOptionType } from './steps/service-form-review/service-form-review';
import { ServiceFormReviewStep } from './steps/service-form-review/service-form-review-step';
import TabGroupContainer from './tab-group-container';

export type TransactionDetails = {
    policyNumber: string;
    transactionSubType: string;
    requestSubType: string;
    formName: string;
};

interface NigoEntryContainerContainerProps {
    policyNumber: string;
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
    policyNumber,
    planCode,
    docType,
    clientCode,
    nigoExceptions,
    nigoSubExceptions,
    taskInfoLink,
}: NigoEntryContainerContainerProps) => {
    const { featureFlags } = useOptimizely();
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'nigoEntry',
    });
    const {
        setTransactionType,
        setTransactionSubType,
        setDocument,
        sectionOption,
    } = useNigoEntry();
    const [policy, setPolicy] = useState<Policy>();
    const [availableFormsTransactions, setAvailableFormsTransactions] =
        useState<AvailableFormsTransaction[]>([]);
    const [prevTransactionDetails, setPrevTransactionDetails] =
        useState<AdditionalDataInstance | null>(null);

    const getTransactions = async (policyInfo: Policy) => {
        const transactionRequestBody: SearchTransactionRequestBody = {
            carrier: policyInfo?.carrierId || '',
            issueState: policyInfo?.issueState || '',
            planCode: policyInfo?.product?.planCode || '',
        };
        const data = await getSearchTransactions(transactionRequestBody);
        if (!data) {
            return;
        }
        setAvailableFormsTransactions(data);
    };

    const transactionOptions = useMemo(() => {
        return availableFormsTransactions?.map((transaction) => {
            return { label: transaction.name, value: transaction.id };
        });
    }, [availableFormsTransactions]);

    useEffect(() => {
        const getPolicy = async () => {
            try {
                // Fetch policy
                const data = await fetchPolicy(policyNumber, planCode);
                if (!data) {
                    return;
                }

                setPolicy(data);
            } catch (error) {
                browserLogInfo('nigo-entry-container::getPolicy', {
                    message: 'Error occurred in policy retrieval',
                    payload: { policyNumber, planCode },
                    file: 'nigo-entry-container',
                });
            }
        };

        getPolicy();
    }, [policyNumber, planCode]);

    useEffect(() => {
        if (!policy) {
            return;
        }
        getTransactions(policy);
    }, [policy]);

    useEffect(() => {
        const searchCases = async () => {
            const filters = {
                policyNumber: policyNumber,
                limit: 25,
                offset: 0,
                sortDirection: 'desc',
                sortBy: 'createdAt',
                carrier: [clientCode?.toUpperCase()],
                process: [Processes.Correspondence as string],
            };
            let searchCasesResponse = null;
            try {
                searchCasesResponse = await getCases(filters, featureFlags);
                if (searchCasesResponse && 'total' in searchCasesResponse) {
                    const latestForm = searchCasesResponse?.data?.find(
                        (item) =>
                            item?.additionalData?.requestSubType.toUpperCase() ===
                            docType.toUpperCase()
                    );
                    setPrevTransactionDetails(
                        latestForm?.additionalData || null
                    );
                } else {
                    throw new Error(
                        searchCasesResponse?.data?.err
                            ? searchCasesResponse.data.err
                            : 'Error fetching cases'
                    );
                }
            } catch (error) {
                browserLogInfo('nigo-entry-container::searchCases', {
                    message: 'Error occurred in policy retrieval',
                    payload: { policyNumber, planCode },
                    file: 'nigo-entry-container',
                });
                setPrevTransactionDetails(null);
            }
        };
        if (policyNumber && clientCode) {
            searchCases();
        }
    }, [clientCode, docType, featureFlags, planCode, policyNumber]);

    useEffect(() => {
        const initialize = async () => {
            if (prevTransactionDetails) {
                const transType = prevTransactionDetails?.requestSubType
                    .replace(/ /g, '_')
                    .toUpperCase();
                const formName = prevTransactionDetails?.formName;
                setTransactionType({
                    selected: transType,
                    list: transactionOptions,
                });
                try {
                    const response = await getTransactionSubTypes(transType);
                    const transSubType =
                        response?.find(
                            (transaction) =>
                                transaction.name ===
                                    prevTransactionDetails?.transactionSubType ||
                                ''
                        )?.id || '';

                    if (response) {
                        const options = response.map((transaction) => {
                            return {
                                label: transaction.name,
                                value: transaction.id,
                            };
                        });
                        setTransactionSubType({
                            selected: transSubType,
                            list: options,
                        });

                        const formSearchRequestBody = {
                            contractNumber: policy?.policyNumber ?? '',
                            planCode: policy?.product?.planCode ?? '',
                            transactionType: transType,
                            transactionSubType: transSubType,
                            carrier: policy?.carrierId ?? '',
                            issueState: policy?.issueState ?? '',
                            ctiCallNumber: '',
                        };
                        const searchResponse = await searchForms(
                            formSearchRequestBody
                        );
                        const selectedForm = searchResponse?.find(
                            (form) => form.formShortName === formName
                        );
                        if (searchResponse) {
                            setDocument({
                                list: searchResponse,
                                selected: selectedForm || null,
                            });
                        }
                    }
                } catch (e: any) {
                    console.error(
                        'GetTransactionSubTypes::Error retrieving transaction sub types',
                        e
                    );
                }
            }
        };
        if (prevTransactionDetails) {
            initialize();
        }
    }, [
        policy?.carrierId,
        policy?.issueState,
        policy?.policyNumber,
        policy?.product?.planCode,
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
                        policyNumber={policyNumber}
                        documentNumber={documentNumber}
                        docType={docType}
                        clientCode={clientCode}
                        taskInfoLink={taskInfoLink}
                        document={documentData}
                        nigoExceptions={nigoExceptions}
                        nigoSubExceptions={nigoSubExceptions}
                    />
                ),
                screenReaderLabel: t('tabs.serviceFormReview'),
                index: 0,
                text: t('tabs.serviceFormReview'),
            },
            {
                ariaLabel: t('tabs.formEntry'),
                isVisible: () => sectionOption === SelOptionType.DATA_ENTRY,
                component: (
                    <FormEntryStep
                        document={documentData}
                        clientCode={clientCode}
                        docType={docType}
                        planCode={policy?.product?.planCode || planCode}
                    />
                ),
                screenReaderLabel: t('tabs.formEntry'),
                index: 1,
                text: t('tabs.formEntry'),
            },
            {
                ariaLabel: t('tabs.nigoDetails'),
                isVisible: () => sectionOption === SelOptionType.NIGO_ENTRY,
                component: (
                    <NigoDetailsStep
                        nigoExceptions={nigoExceptions}
                        nigoSubExceptions={nigoSubExceptions}
                    />
                ),
                screenReaderLabel: t('tabs.nigoDetails'),
                index: 1,
                text: t('tabs.nigoDetails'),
            },
            {
                ariaLabel: t('tabs.documentSelection'),
                isVisible: () => sectionOption === SelOptionType.NIGO_ENTRY,
                component: (
                    <FormSelectionStep
                        availableFormsTransactions={availableFormsTransactions}
                        policy={policy}
                        documentData={documentData}
                        clientCode={clientCode}
                    />
                ),
                screenReaderLabel: t('tabs.documentSelection'),
                index: 2,
                text: t('tabs.documentSelection'),
            },
            {
                ariaLabel: t('tabs.confirm'),
                isVisible: () => true,
                component: (
                    <ConfirmStep
                        documentNumber={documentNumber}
                        docType={docType}
                        clientCode={clientCode}
                        document={documentData}
                    />
                ),
                screenReaderLabel: t('tabs.confirm'),
                index: 3,
                text: t('tabs.confirm'),
            },
        ],
        [
            availableFormsTransactions,
            clientCode,
            docType,
            documentData,
            documentNumber,
            nigoExceptions,
            nigoSubExceptions,
            planCode,
            policy,
            policyNumber,
            sectionOption,
            t,
            taskInfoLink,
        ]
    );

    const filteredSteps: Step[] = useMemo(
        () =>
            steps
                .filter((item: any) => item.isVisible?.())
                .map((item: any, index: number) => ({ ...item, index })),
        [steps]
    );

    return (
        <TabGroupContainer
            steps={filteredSteps}
            policy={policy}
            documentNumber={documentNumber}
            docType={docType}
            documentData={documentData}
            policyNumber={policyNumber}
            clientCode={clientCode}
        ></TabGroupContainer>
    );
};

export default NigoEntryContainer;
