import { getAccessToken, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { buildTaskLink } from '@deps/components/tasks-listing/task-listing.helpers';
import { TranslationFiles } from '@deps/config/translations';
import { ProcessesToCaseTypeMap } from '@deps/constants/case';
import NigoEntryContainer from '@deps/containers/nigo-entry-container/components/nigo-entry-container';
import { NigoEntryProvider } from '@deps/containers/nigo-entry-container/components/nigo-entry-provider';
import { getNigoExceptions } from '@deps/containers/nigo-entry-container/components/steps/nigo-details/nigo-details.helper';
import { FormProvider } from '@deps/containers/otp/withdrawal-forms/components/form-provider';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { Processes } from '@deps/models/case/case';
import { DocumentData } from '@deps/models/case/document';
import { docTypes } from '@deps/models/case/helpers';
import { LifeCadParty } from '@deps/models/case/lifecad-party';
import { AvailableFormsTransaction, SearchTransactionRequestBody } from '@deps/models/case/send-document';
import { TaskStatus } from '@deps/models/case/task-instance';
import { ActiveWithdrawalCase, Carrier } from '@deps/models/case/withdrawal/case';
import { Policy } from '@deps/models/policy/sor-policy';
import { UserPermission } from '@deps/models/user-profile';
import { mapTaskToActiveWithdrawalCaseTask } from '@deps/operations/tasks/v2/helpers';
import { getSearchTransactionsSSR } from '@deps/queries/api/c2web';
import { searchCasesSSR } from '@deps/queries/api/cases';
import { getDocumentSSR } from '@deps/queries/api/documents';
import { checkNigoExistsSSR } from '@deps/queries/api/integration';
import { getPolicyDetailsSsr, getPolicyPartiesSSR, searchPolicySSR } from '@deps/queries/api/policies';
import { getCaseTaskByIdSSR } from '@deps/queries/api/v2/task';
import { SegmentPageName, SegmentTrackedPageProps } from '@deps/types/segment-analytics';
import { FEATURE_FLAGS, FeatureKeyIdentifier } from '@deps/utils/optimizely/flags';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { logWarn, logError, getUserInfoFromUser, parseErrorInformation, logInfo } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

import { ERROR_CODES } from '../create-case/error';

export type TransactionDetails = {
    policyNumber: string;
    transactionSubType: string;
    requestSubType: string;
    formName: string;
};

interface NigoEntryProps extends SegmentTrackedPageProps {
    documentNumber: string;
    policy: Policy;
    planCode: string;
    availableFormsTransactions: AvailableFormsTransaction[];
    docType: string;
    clientCode: string;
    nigoExceptions: any;
    nigoSubExceptions: any;
    form: ActiveWithdrawalCase;
    featureFlagDecisions?: FeatureFlags;
    parties?: LifeCadParty[];
    document: DocumentData;
    taskInfoLink: string;
    prevTransactionDetails: TransactionDetails | null;
    isNigoCase?: boolean;
}

const isNigoEntryEnabled = (clientId: string, process: string, featureFlagMap: FeatureFlags) => {
    const identifier = `NIGO_ENTRY_${clientId.toUpperCase()}_${process.toUpperCase().replaceAll(' ', '_')}` as FeatureKeyIdentifier;
    const featureKey = FEATURE_FLAGS[identifier];
    return featureKey && featureFlagMap[featureKey] ? featureFlagMap[featureKey] : false;
};

const NigoEntry = ({
    policy,
    planCode,
    availableFormsTransactions,
    documentNumber,
    docType,
    clientCode,
    nigoExceptions,
    nigoSubExceptions,
    form,
    parties,
    featureFlagDecisions,
    document,
    taskInfoLink,
    prevTransactionDetails,
    isNigoCase,
    user,
}: NigoEntryProps) => {
    useSegmentPageTracker(user, SegmentPageName.NigoEntry, {
        policyNumber: policy?.policyNumber,
        planCode,
        documentNumber,
        docType,
        clientCode,
        nigoExceptions,
        nigoSubExceptions,
    });

    return (
        <div className="flex w-full flex-col overflow-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
            <FormProvider
                form={form}
                initialForm={form}
                issueState={''}
                isOpenNigo={isNigoCase}
                featureFlagDecisions={featureFlagDecisions}
                parties={parties}
            >
                <NigoEntryProvider>
                    <NigoEntryContainer
                        documentNumber={documentNumber}
                        policy={policy}
                        planCode={planCode}
                        availableFormsTransactions={availableFormsTransactions}
                        docType={docType}
                        clientCode={clientCode}
                        nigoExceptions={nigoExceptions}
                        nigoSubExceptions={nigoSubExceptions}
                        documentData={document}
                        taskInfoLink={taskInfoLink}
                        prevTransactionDetails={prevTransactionDetails}
                    />
                </NigoEntryProvider>
            </FormProvider>
        </div>
    );
};

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: async (context: GetServerSidePropsContext) => {
        const user = await getUserData(context);
        const userInfoForLogging = getUserInfoFromUser(user);

        const { locale = DEFAULT_LOCALE, query, req, res } = context;
        const taskId = (query.taskId as string) || '';
        const featureFlagDecisions: FeatureFlags = await optimizelyService.getFeatureFlagDecisions(user.sub);
        let accessToken;
        try {
            accessToken = (await getAccessToken(req, res)).accessToken;
        } catch (e) {
            logWarn('getServerSidePropsNigoEntryPage::Access token expired', {
                ...parseErrorInformation(e),
                file: 'pages/nigo-entry',
                function: 'getServerSideProps',
                user: userInfoForLogging.email,
            });
            return serverSidePropsLogout();
        }
        // Create a permissions object to pass to the page, strongly typed using the enum.
        const doesUserHasPagePermissions = await doesUserHavePagePermissions(accessToken, user, UserPermission.AllowReadOtpRenewals);

        if (!doesUserHasPagePermissions) {
            return {
                redirect: {
                    destination: '/403',
                    permanent: false,
                },
            };
        }

        try {
            const [translations, activeForm] = await Promise.all([
                await serverSideTranslations(locale, [TranslationFiles.COMMON, TranslationFiles.COLDEFS], nextI18nextConfig, ALL_LOCALES),
                await getCaseTaskByIdSSR(taskId, accessToken),
            ]);

            if (!activeForm) {
                logError('nigo-entry::Error getting task by id', {
                    taskId,
                    file: 'pages/nigo-entry',
                    function: 'getServerSideProps',
                    user: userInfoForLogging.email,
                });
                return {
                    redirect: {
                        destination: `/create-case/error?errorCode=${ERROR_CODES.TASK_INITIALIZATION}`,
                        permanent: false,
                    },
                };
            }

            logInfo('nigo-entry::getCaseTaskByIdSSR task active form found', {
                taskId,
                file: 'pages/nigo-entry',
                function: 'getServerSideProps',
                user: userInfoForLogging.email,
            });

            const form = mapTaskToActiveWithdrawalCaseTask(activeForm, { ...activeForm.data, userId: user?.name });
            const { documentNumber, contractNum, clientCode } = activeForm?.data || {};
            const caseType = ProcessesToCaseTypeMap[activeForm.process as Processes];
            const docType = caseType ? docTypes[caseType] : null;

            if (!caseType) {
                logError('nigo-entry::Error getting case type', {
                    taskId,
                    caseType,
                    documentType: docType,
                    documentNumber,
                    contractNum,
                    clientCode,
                    file: 'pages/nigo-entry',
                    function: 'getServerSideProps',
                    user: userInfoForLogging.email,
                });
                return {
                    redirect: {
                        destination: `/create-case/error?errorCode=${ERROR_CODES.CASE_TYPE_RETRIEVAL_ERROR}`,
                        permanent: false,
                    },
                };
            }

            if (!docType) {
                logError('nigo-entry::Error getting doc type', {
                    taskId,
                    file: 'pages/nigo-entry',
                    function: 'getServerSideProps',
                    user: userInfoForLogging.email,
                });
                return {
                    redirect: {
                        destination: `/create-case/error?errorCode=${ERROR_CODES.DOC_TYPE_RETRIEVAL_ERROR}`,
                        permanent: false,
                    },
                };
            }

            const shouldShowNigoEntry = isNigoEntryEnabled(clientCode, caseType, featureFlagDecisions);
            // If feature flag is not enabled, redirect to error page
            if (!shouldShowNigoEntry) {
                logWarn('nigo_entry::feature flag not enabled', { taskId, clientCode });
                return {
                    redirect: {
                        destination: '/403',
                        permanent: false,
                    },
                };
            }

            const response = await searchPolicySSR(contractNum, [clientCode?.toUpperCase() as Carrier], accessToken, 1, 0);
            const planCode = response ? response[0]?.planCode : null;
            if (!planCode) {
                logError('nigo-entry::Policy pan code not found', {
                    taskId,
                    documentNumber,
                    clientCode,
                    contractNum,
                    file: 'pages/nigo-entry',
                    function: 'getServerSideProps',
                    user: userInfoForLogging.email,
                });
                return {
                    redirect: {
                        destination: `/create-case/error?errorCode=${ERROR_CODES.RENEWAL_FORM_PLAN_CODE}`,
                        permanent: false,
                    },
                };
            }

            const policy = await getPolicyDetailsSsr(contractNum, planCode, accessToken, userInfoForLogging);
            if (!policy) {
                logError('nigo-entry::Policy not found', {
                    taskId,
                    documentNumber,
                    clientCode,
                    contractNum,
                    file: 'pages/nigo-entry',
                    function: 'getServerSideProps',
                    user: userInfoForLogging.email,
                });
                return {
                    redirect: {
                        destination: `/create-case/error?errorCode=${ERROR_CODES.POLICY_NOT_FOUND}`,
                        permanent: false,
                    },
                };
            }

            const nigoFilters = {
                categoryIds: ['Form', 'Signature', 'Account Information'],
                carrier: clientCode?.toUpperCase(),
                process: activeForm?.process,
            };

            const transactionRequestBody: SearchTransactionRequestBody = {
                carrier: policy.carrierId || '',
                issueState: policy.issueState || '',
                planCode: policy.product?.planCode || '',
            };

            const [availableFormsTransactions, nigoExceptionResponse] = await Promise.all([
                await getSearchTransactionsSSR(transactionRequestBody, accessToken, userInfoForLogging),
                await getNigoExceptions(nigoFilters, accessToken),
            ]);

            const { nigoExceptions, nigoSubExceptions } = nigoExceptionResponse;
            const taskInfoLink = buildTaskLink(taskId, form.caseId, caseType, documentNumber, clientCode);
            const filters = {
                policyNumber: contractNum,
                limit: 25,
                offset: 0,
                sortDirection: 'desc',
                sortBy: 'createdAt',
                carrier: [clientCode.toUpperCase()],
                process: [Processes.Correspondence as string],
            };

            const [parties, document, searchCasesResponse] = await Promise.all([
                await getPolicyPartiesSSR(contractNum, clientCode, accessToken as string),
                await getDocumentSSR(documentNumber, docType, clientCode?.toUpperCase(), accessToken),
                await searchCasesSSR(filters, accessToken),
            ]);

            if (!document) {
                logError('nigoEntry::Error getting document', {
                    documentNumber,
                    clientCode,
                    contractNum,
                    taskId,
                    docType,
                    user: userInfoForLogging.email,
                });
                return {
                    redirect: {
                        destination: `/create-case/error?errorCode=${ERROR_CODES.DOCUMENT_RETRIEVAL}`,
                        permanent: false,
                    },
                };
            }

            let isNigoCase = false;
            const shouldShowNewExperience = featureFlagDecisions?.[FEATURE_FLAGS.NEW_EXP];
            if (shouldShowNewExperience) {
                isNigoCase = await checkNigoExistsSSR(clientCode?.toUpperCase(), document.caseId, accessToken);

                if (isNigoCase && form?.status !== TaskStatus.Completed) {
                    logInfo('nigoEntry::Nigo exists for case', {
                        documentNumber,
                        clientCode,
                        caseId: document.caseId,
                        lob: document?.lob,
                    });
                    return {
                        redirect: {
                            destination: `/create-case/error?errorCode=${ERROR_CODES.NIGO_EXISTS}`,
                            permanent: false,
                        },
                    };
                } else {
                    logInfo('nigoEntry::Skipping NIGO check', { taskId, documentNumber, clientCode, user: userInfoForLogging.email });
                }
            }

            const latestForm = searchCasesResponse?.data?.find(
                item => item?.additionalData?.requestSubType.toUpperCase() === docType.toUpperCase()
            );
            return {
                props: {
                    ...translations,
                    form,
                    parties,
                    documentNumber,
                    clientCode,
                    docType: docType,
                    policy,
                    availableFormsTransactions,
                    nigoExceptions,
                    nigoSubExceptions,
                    user,
                    featureFlagDecisions,
                    document,
                    taskInfoLink,
                    prevTransactionDetails: latestForm?.additionalData || null,
                    isNigoCase,
                },
            };
        } catch (error) {
            logError('getServerSidePropsNigoEntryPage', { ...parseErrorInformation(error) });
            return {
                props: {},
            };
        }
    },
});

export default NigoEntry;
