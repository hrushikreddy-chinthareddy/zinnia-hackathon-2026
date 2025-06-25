import { getAccessToken } from '@auth0/nextjs-auth0';
import { Party, PolicyPartyRoles } from '@zinnia/api-types/types/sor';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { buildTaskLink } from '@deps/components/tasks-listing/task-listing.helpers';
import { TranslationFiles } from '@deps/config/translations';
import { ProcessesToCaseTypeMap } from '@deps/constants/case';
import NigoEntryContainer from '@deps/containers/nigo-entry-container/components/nigo-entry-container';
import { NigoEntryProvider } from '@deps/containers/nigo-entry-container/components/nigo-entry-provider';
import { getNigoExceptions } from '@deps/containers/nigo-entry-container/components/steps/nigo-details/nigo-details.helpers';
import RenewalFormProvider from '@deps/containers/otp/renewal-forms/components/renewal-form-provider';
import { FormProvider } from '@deps/containers/otp/withdrawal-forms/components/form-provider';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { useAccountInfo } from '@deps/hooks/otp-withdrawal/useAccountInfo';
import { useContractAccountInfo } from '@deps/hooks/otp-withdrawal/useContractAccountInfo';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { CaseType, Processes } from '@deps/models/case/case';
import { DocumentData } from '@deps/models/case/document';
import { docTypes } from '@deps/models/case/helpers';
import { LifeCadParty } from '@deps/models/case/lifecad-party';
import { UserPermission } from '@deps/models/user-profile';
import { mapTaskToActiveRenewalCaseTask, mapTaskToActiveWithdrawalCaseTask } from '@deps/operations/tasks/v2/helpers';
import { searchCasesSSR } from '@deps/queries/api/cases';
import { getDocumentV2SSR } from '@deps/queries/api/documents';
import { getPolicyDetailsSsr, getPolicyPartiesSSR, searchPolicySSR } from '@deps/queries/api/policies';
import { getCaseTaskByIdSSR } from '@deps/queries/api/v2/task';
import { SegmentPageName, SegmentTrackedPageProps } from '@deps/types/segment-analytics';
import { FEATURE_FLAGS, FeatureKeyIdentifier } from '@deps/utils/optimizely/flags';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { isFastFeatureEnabled } from '@deps/utils/optimizely/utils';
import { logWarn, logError, parseErrorInformation, logInfo, withPageAuthAndLogging } from '@deps/utils/server-logging';
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
    policyNumber: string;
    planCode: string;
    caseType: CaseType;
    docType: string;
    clientCode: string;
    nigoExceptions: any;
    nigoSubExceptions: any;
    form: any;
    featureFlagDecisions?: FeatureFlags;
    parties?: LifeCadParty[] | Party[];
    document: DocumentData;
    taskInfoLink: string;
    prevTransactionDetails: TransactionDetails | null;
    isNigoCase?: boolean;
    partyRoles?: PolicyPartyRoles[];
}

const isNigoEntryEnabled = (clientId: string, process: string, featureFlagMap: FeatureFlags) => {
    const identifier = `NIGO_ENTRY_${clientId?.toUpperCase()}_${process?.toUpperCase().replaceAll(' ', '_')}` as FeatureKeyIdentifier;
    const featureKey = FEATURE_FLAGS[identifier];
    return featureKey && featureFlagMap[featureKey] ? featureFlagMap[featureKey] : false;
};

const NigoEntry = ({
    policyNumber,
    planCode,
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
    caseType,
    partyRoles,
}: NigoEntryProps) => {
    useSegmentPageTracker(user, SegmentPageName.NigoEntry, {
        policyNumber,
        planCode,
        documentNumber,
        docType,
        clientCode,
        nigoExceptions,
        nigoSubExceptions,
    });

    const isLC = !isFastFeatureEnabled(form.taskType, featureFlagDecisions);
    const accountInfo = useAccountInfo(document.contract, clientCode as string);
    const contractAccountInfo = useContractAccountInfo(document.contract, planCode as string);
    const { issueState } = isLC ? accountInfo : contractAccountInfo;

    return (
        <div className="flex w-full flex-col overflow-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
            {caseType === CaseType.Renewal ? (
                <RenewalFormProvider
                    initialForm={form}
                    parties={Array.isArray(parties) ? (parties as LifeCadParty[]) : ([] as LifeCadParty[])}
                    form={form}
                    userId={''}
                    document={document}
                    action={'' as string}
                    planCode={planCode}
                    featureFlagDecisions={featureFlagDecisions as FeatureFlags}
                >
                    <NigoEntryProvider>
                        <NigoEntryContainer
                            documentNumber={documentNumber}
                            policyNumber={document?.contract}
                            planCode={planCode}
                            docType={docType}
                            clientCode={clientCode}
                            nigoExceptions={nigoExceptions}
                            nigoSubExceptions={nigoSubExceptions}
                            documentData={document}
                            taskInfoLink={taskInfoLink}
                            prevTransactionDetails={prevTransactionDetails}
                        />
                    </NigoEntryProvider>
                </RenewalFormProvider>
            ) : (
                <FormProvider
                    form={form}
                    initialForm={form}
                    issueState={issueState}
                    isOpenNigo={isNigoCase}
                    featureFlagDecisions={featureFlagDecisions}
                    parties={parties}
                    partyRoles={partyRoles}
                >
                    <NigoEntryProvider>
                        <NigoEntryContainer
                            documentNumber={documentNumber}
                            policyNumber={policyNumber}
                            planCode={planCode}
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
            )}
        </div>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            const user = await getUserData(context);

            const { locale = DEFAULT_LOCALE, query, req, res } = context;
            const taskId = (query.taskId as string) || '';
            const featureFlagDecisions: FeatureFlags = await optimizelyService.getFeatureFlagDecisions(user.sub, loggingContext);
            let accessToken;
            try {
                accessToken = (await getAccessToken(req, res)).accessToken;
            } catch (e) {
                logWarn('getServerSidePropsNigoEntryPage::Access token expired', {
                    ...parseErrorInformation(e),
                    ...loggingContext,
                });
                return serverSidePropsLogout();
            }
            // Create a permissions object to pass to the page, strongly typed using the enum.
            const doesUserHasPagePermissions = await doesUserHavePagePermissions(
                context,
                UserPermission.AllowReadOtpRenewals,
                loggingContext
            );

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
                    await serverSideTranslations(
                        locale,
                        [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
                        nextI18nextConfig,
                        ALL_LOCALES
                    ),
                    await getCaseTaskByIdSSR(taskId, accessToken, loggingContext),
                ]);

                if (!activeForm) {
                    logError('nigo-entry::Error getting task by id', loggingContext);
                    return {
                        redirect: {
                            destination: `/create-case/error?errorCode=${ERROR_CODES.TASK_INITIALIZATION}`,
                            permanent: false,
                        },
                    };
                }

                const { documentNumber, contractNum, clientCode, lob } = activeForm?.data || {};
                logInfo('nigo-entry::getCaseTaskByIdSSR task active form found', loggingContext);

                const caseType = ProcessesToCaseTypeMap[activeForm.process as Processes];
                const docType = caseType ? docTypes[caseType] : null;

                const form =
                    caseType === CaseType.Renewal
                        ? mapTaskToActiveRenewalCaseTask(activeForm, { ...activeForm?.data, userId: user?.name })
                        : mapTaskToActiveWithdrawalCaseTask(activeForm, { ...activeForm?.data, userId: user?.name });

                if (!caseType) {
                    logWarn('nigo-entry::Error getting case type', {
                        caseType,
                        documentType: docType,
                        documentNumber,
                        contractNum,
                        clientCode: clientCode ?? lob,
                        ...loggingContext,
                    });
                    return {
                        redirect: {
                            destination: `/create-case/error?errorCode=${ERROR_CODES.CASE_TYPE_RETRIEVAL_ERROR}`,
                            permanent: false,
                        },
                    };
                }

                if (!docType) {
                    logWarn('nigo-entry::Error getting doc type', {
                        taskId,
                        clientCode,
                        documentType: docType,
                        documentNumber,
                        contractNum,
                        ...loggingContext,
                    });
                    return {
                        redirect: {
                            destination: `/create-case/error?errorCode=${ERROR_CODES.DOC_TYPE_RETRIEVAL_ERROR}`,
                            permanent: false,
                        },
                    };
                }

                if (!clientCode) {
                    logError('nigo-entry::Error getting client code', {
                        taskId,
                        clientCode,
                        documentType: docType,
                        documentNumber,
                        contractNum,
                        ...loggingContext,
                    });
                    return {
                        redirect: {
                            destination: `/create-case/error?errorCode=${ERROR_CODES.CLIENT_CODE_RETRIEVAL_ERROR}`,
                            permanent: false,
                        },
                    };
                }

                const shouldShowNigoEntry =
                    caseType !== CaseType.Renewal ? isNigoEntryEnabled(clientCode, caseType, featureFlagDecisions) : true;
                // If feature flag is not enabled, redirect to error page
                if (!shouldShowNigoEntry) {
                    logWarn('nigo_entry::feature flag not enabled', {
                        taskId,
                        clientCode,
                        documentType: docType,
                        documentNumber,
                        contractNum,
                        ...loggingContext,
                    });
                    return {
                        redirect: {
                            destination: '/403',
                            permanent: false,
                        },
                    };
                }

                const taskInfoLink = buildTaskLink(taskId, form?.caseId ?? '', caseType, documentNumber, clientCode);
                const filters = {
                    policyNumber: contractNum,
                    limit: 25,
                    offset: 0,
                    sortDirection: 'desc',
                    sortBy: 'createdAt',
                    carrier: [clientCode?.toUpperCase()],
                    process: [Processes.Correspondence as string],
                };

                const nigoFilters = {
                    categoryIds: ['Form', 'Signature', 'Account Information', 'Data Entry'],
                    carrier: clientCode?.toUpperCase(),
                    process: activeForm?.process,
                };

                const document = await getDocumentV2SSR(documentNumber, docType, clientCode?.toUpperCase(), accessToken, loggingContext);
                if (!document) {
                    logWarn('nigoEntry::Error getting document', {
                        taskId,
                        documentNumber,
                        documentType: docType,
                        clientCode,
                        contractNum,
                        ...loggingContext,
                    });
                    return {
                        redirect: {
                            destination: `/create-case/error?errorCode=${ERROR_CODES.DOCUMENT_RETRIEVAL}`,
                            permanent: false,
                        },
                    };
                }
                // Required for renewal
                const docContract = document?.contract;

                logInfo('nigo-entry::Retrieved document', {
                    taskId,
                    documentNumber,
                    documentType: docType,
                    clientCode,
                    contractNum: contractNum ?? docContract,
                    ...loggingContext,
                });

                const [parties, searchCasesResponse, policies, nigoExceptionResponse] = await Promise.all([
                    await getPolicyPartiesSSR(contractNum ?? docContract, clientCode, accessToken as string, loggingContext),
                    await searchCasesSSR(filters, accessToken, loggingContext, featureFlagDecisions),
                    await searchPolicySSR(contractNum ?? docContract, [clientCode?.toUpperCase()], accessToken, 1, 0, loggingContext),
                    await getNigoExceptions(nigoFilters, accessToken, loggingContext),
                ]);

                const planCode = policies?.[0]?.planCode || null;
                const { nigoExceptions, nigoSubExceptions } = nigoExceptionResponse;
                logInfo('nigo-entry::Retrieved parties, document, planCode, nigoExceptions and correspondence case search result', {
                    taskId,
                    documentNumber,
                    documentType: docType,
                    clientCode,
                    contractNum: contractNum ?? docContract,
                    planCode,
                    ...loggingContext,
                });

                const latestForm =
                    !isNullEmptyOrUndefined(docType) &&
                    searchCasesResponse?.data?.find(item => item?.additionalData?.requestSubType?.toUpperCase() === docType.toUpperCase());

                const isLC = !isFastFeatureEnabled(form?.taskType, featureFlagDecisions);

                if (!isLC) {
                    // should get parties from policy api
                    const policy = await getPolicyDetailsSsr(document?.contract, planCode, accessToken, loggingContext, true);
                    if (!policy) {
                        logInfo('create-case/withdrawal/:id::Policy not found', loggingContext);
                        return {
                            redirect: {
                                destination: `/create-case/error?errorCode=${ERROR_CODES.POLICY_NOT_FOUND}`,
                                permanent: false,
                            },
                        };
                    }
                    logInfo('create-case/withdrawal/:id::Policy details found', loggingContext);

                    const { parties, partyRoles = [] } = policy ?? {};

                    return {
                        props: {
                            ...translations,
                            form,
                            parties,
                            partyRoles,
                            documentNumber,
                            clientCode,
                            docType: docType,
                            caseType,
                            planCode,
                            policyNumber: contractNum ?? docContract,
                            nigoExceptions,
                            nigoSubExceptions,
                            user,
                            featureFlagDecisions,
                            document,
                            taskInfoLink: taskInfoLink ?? '', // to check this
                            prevTransactionDetails: latestForm ? latestForm?.additionalData || null : null,
                            isNigoCase: false,
                        },
                    };
                } else {
                    return {
                        props: {
                            ...translations,
                            form,
                            parties,
                            partyRoles: [],
                            documentNumber,
                            clientCode,
                            docType: docType,
                            caseType,
                            planCode,
                            policyNumber: contractNum ?? docContract,
                            nigoExceptions,
                            nigoSubExceptions,
                            user,
                            featureFlagDecisions,
                            document,
                            taskInfoLink: taskInfoLink ?? '', // to check this
                            prevTransactionDetails: latestForm ? latestForm?.additionalData || null : null,
                            isNigoCase: false,
                        },
                    };
                }
            } catch (error) {
                logError('nigoEnty::Error', { ...parseErrorInformation(error), ...loggingContext });
                return {
                    props: {},
                };
            }
        },
    },
    { file: 'nigo-entry/index', function: 'getServerSideProps', page: 'nigo-entry' }
);

export default NigoEntry;
