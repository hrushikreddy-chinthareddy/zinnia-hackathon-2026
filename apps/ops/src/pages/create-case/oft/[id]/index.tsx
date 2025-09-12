import { getAccessToken } from '@auth0/nextjs-auth0';
import { Party } from '@zinnia/api-types/types/sor';
import clsx from 'clsx';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useEffect, useState, useMemo } from 'react';

import FormNigoMessages from '@deps/components/form-nigos/form-nigo-messages';
import OtpLayout from '@deps/components/otp-layout';
import NoteSection from '@deps/components/otp-withdrawal-form/note-section';
import WithdrawalDrawer, {
    SidebarContent,
} from '@deps/components/otp-withdrawal-form/withdrawal-drawer';
import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import { PageHead } from '@deps/components/page-title';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { NigoExceptionResponse } from '@deps/containers/nigo-entry-container/components/steps/nigo-details/nigo-details.types';
import OftDlicForm from '@deps/containers/otp/oft-forms/dlic/dlic-oft-form';
import FlicOftWithdrawalForm from '@deps/containers/otp/oft-forms/flic/flic-oft-form';
import GdmnOftWithdrawalForm from '@deps/containers/otp/oft-forms/gdmn/gdmn-oft-form';
import GlcoOftWithdrawalForm from '@deps/containers/otp/oft-forms/gilico/glco-oft-form';
import MassOftWithdrawalForm from '@deps/containers/otp/oft-forms/mass/mass-oft-form';
import NasuOftWithdrawalForm from '@deps/containers/otp/oft-forms/nasu/nasu-oft-form';
import PrdnOftWithdrawalForm from '@deps/containers/otp/oft-forms/prdn/prdn-oft-form';
import RSLNOftWithdrawalForm from '@deps/containers/otp/oft-forms/rsln/rsln-oft-form';
import SbgcOftWithdrawalForm from '@deps/containers/otp/oft-forms/sbgc/sbgc-oft-form';
import UlpcOftWithdrawalForm from '@deps/containers/otp/oft-forms/ulpc/ulpc-oft-form';
import UsaaOftWithdrawalForm from '@deps/containers/otp/oft-forms/usaa/usaa-oft-form';
import { FormControls } from '@deps/containers/otp/withdrawal-forms/components/form-controls';
import { FormErrors } from '@deps/containers/otp/withdrawal-forms/components/form-errors';
import { FormProvider } from '@deps/containers/otp/withdrawal-forms/components/form-provider';
import { DiaryNotesProvider } from '@deps/contexts/DiaryNotesContext';
import { determineFormToRender } from '@deps/helpers/form-selector.helpers';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { shouldNavbarOverlay } from '@deps/helpers/page-layout';
import {
    doesUserHavePagePermissions,
    getUserData,
} from '@deps/helpers/query-data.helpers';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import {
    deStringifyTrueFalseNull,
    toTitleCase,
} from '@deps/helpers/string.helpers';
import { useContractAccountInfo } from '@deps/hooks/otp-withdrawal/useContractAccountInfo';
import { useScreenSize } from '@deps/hooks/useScreenSize';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { Processes } from '@deps/models/case/case';
import { DocumentData, DocumentType } from '@deps/models/case/document';
import { ProcessType } from '@deps/models/case/enums';
import { LifeCadParty } from '@deps/models/case/lifecad-party';
import { TaskType } from '@deps/models/case/task';
import {
    ActiveWithdrawalCase,
    Carrier,
    FASTQualTypes,
    PartyRoles,
    QualTypes,
} from '@deps/models/case/withdrawal/case';
import { UserPermission } from '@deps/models/user-profile';
import { initializeOTPTaskSSR } from '@deps/operations/tasks/v2/initialize';
import { getDocumentV2SSR } from '@deps/queries/api/documents';
import { searchNigoExceptions } from '@deps/queries/api/exception-refs';
import { checkNigoExistsSSR } from '@deps/queries/api/integration';
import {
    getPolicyDetailsSsr,
    getPolicyPartiesSSR,
    searchPolicySSR,
} from '@deps/queries/api/policies';
import { SCREEN_BREAKPOINTS } from '@deps/types/constants';
import {
    SegmentPageName,
    SegmentTrackedPageProps,
} from '@deps/types/segment-analytics';
import { getCarrierNameByClientId } from '@deps/utils/carriers';
import { isNonProductionEnvironment } from '@deps/utils/environment.helpers';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    FeatureFlags,
    optimizelyService,
} from '@deps/utils/optimizely/optimizely';
import {
    isFastFeatureEnabled,
    isFormFeatureEnabled,
} from '@deps/utils/optimizely/utils';
import {
    logError,
    logInfo,
    logWarn,
    parseErrorInformation,
    withPageAuthAndLogging,
} from '@deps/utils/server-logging';

import { ERROR_CODES } from '../../error';

interface OftCaseProps extends SegmentTrackedPageProps {
    document: DocumentData;
    form: ActiveWithdrawalCase;
    userId: string;
    formParts: React.ReactNode;
    featureFlagDecisions: FeatureFlags;
    parties: LifeCadParty[] | Party[];
    planCode: string;
    nigoExceptions: NigoExceptionResponse[];
}

const DefaultSidebarContent = {
    contractId: '',
    documentNumber: '',
    caseId: '',
    transactions: [],
    ownerName: '',
    annuitantName: '',
};

const getFormComponentMap = (
    planCode: string | '',
    qualType: QualTypes | FASTQualTypes | ''
): Record<string, React.ReactNode> => ({
    [Carrier.FLIC]: <FlicOftWithdrawalForm qualType={qualType} />,
    [Carrier.GLCO]: <GlcoOftWithdrawalForm />,
    [Carrier.MASS]: <MassOftWithdrawalForm />,
    [Carrier.SBGC]: <SbgcOftWithdrawalForm planCode={planCode} />,
    [Carrier.DLIC]: <OftDlicForm qualType={qualType} planCode={planCode} />,
    [Carrier.RSLN]: <RSLNOftWithdrawalForm qualType={qualType} />,
    [Carrier.GDMN]: <GdmnOftWithdrawalForm qualType={qualType} />,
    [Carrier.USAA]: <UsaaOftWithdrawalForm />,
    [Carrier.NASU]: <NasuOftWithdrawalForm />,
    [Carrier.ULPC]: <UlpcOftWithdrawalForm />,
    [Carrier.PRDN]: <PrdnOftWithdrawalForm />,
});

export default function OftCase({
    document,
    form,
    featureFlagDecisions,
    user,
    parties,
    planCode = '',
    nigoExceptions,
}: OftCaseProps) {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request',
    });

    const router = useRouter();
    const searchParams = useSearchParams();
    const isFormReadOnly = searchParams.get('action') === 'readonly';

    const { clientId, clientIdOverride } = router.query;
    const clientForFormDetermination = isNonProductionEnvironment()
        ? clientIdOverride || clientId
        : clientId;

    const isLC = !isFastFeatureEnabled(form?.taskType, featureFlagDecisions);
    const contractAccountInfo = useContractAccountInfo(
        document.contract,
        planCode as string,
        clientId as string,
        isLC
    );
    const { issueState, qualType } = contractAccountInfo;

    useSegmentPageTracker(user, SegmentPageName.OftCase, {
        clientId,
        clientIdOverride,
        clientForFormDetermination,
        documentNumber: document.documentNumber,
        formTaskId: form.taskId,
        qualType,
        issueState,
        planCode,
    });

    const formParts = determineFormToRender(
        clientForFormDetermination as string,
        getFormComponentMap(planCode, qualType as QualTypes)
    );

    if (!formParts) {
        console.error('OFTCase::No form parts', {
            documentNumber: document?.documentNumber,
            clientId,
            contract: document?.contract,
        });
        router.push(
            `/create-case/error?errorCode=${ERROR_CODES.OFT_FORM_CREATION}`
        );
    }

    const [taskApiError, setTaskApiError] = useState('');

    // Transaction Details
    const [transactionDetail, setTransactionDetail] = useState<SidebarContent>(
        DefaultSidebarContent
    );
    const isLargeScreen = useScreenSize(SCREEN_BREAKPOINTS.lg);
    const [isOpenOverride, setIsOpenOverride] = useState<null | boolean>(null);

    const [isLoading, setIsLoading] = useState(false);
    const initialForm = form;
    const ownerName =
        initialForm?.data?.formRequest?.formParty?.parties?.find(
            (party) => party.partyRoleType === PartyRoles.OWNER
        )?.fullName || '';
    const annuitantName =
        initialForm?.data?.formRequest?.formParty?.parties?.find(
            (party) => party.partyRoleType === PartyRoles.ANNUITANT
        )?.fullName || '';

    useEffect(() => {
        setTransactionDetail({
            contractId: document?.contract || '',
            documentNumber: document?.documentNumber || '',
            contractValue: document?.contractValue || '',
            contractStatusCode: document?.contractStatusCode || '',
            caseId: form.caseId || '',
            qualType,
            ownerName: toTitleCase(ownerName).trim(),
            annuitantName: toTitleCase(annuitantName).trim(),
        });
    }, [qualType, document, form, clientId, annuitantName, ownerName]);

    useEffect(() => {
        if (!document) {
            router.push('/create-case');
            return;
        }
    }, [document]);

    // If the user has manually opened or closed the nav drawer, we want to override the default behavior
    const isNavDrawerOpen = useMemo(() => {
        return isOpenOverride !== null ? isOpenOverride : isLargeScreen;
    }, [isOpenOverride, isLargeScreen]);

    // On small screen sizes where the user has manually opened the nav drawer, do NOT overlay.
    const shouldOverlay = useMemo(() => {
        return shouldNavbarOverlay(isLargeScreen, isOpenOverride);
    }, [isLargeScreen, isOpenOverride]);

    const classes = clsx('grid w-full', {
        'grid-cols-[52px,auto]': shouldOverlay,
        'grid-cols-[350px,auto]': !shouldOverlay,
    });

    const formTitle = t(`formTitles.oft`, {
        carrier: getCarrierNameByClientId(clientForFormDetermination as string),
    });
    const caseDetailsData = {
        clientId: clientId as string,
        policyNum: document.contract || '',
    };

    const upFrontNigos = form.data?.formRequest?.formNigos || null;

    const renderUpFrontNigos = isFormReadOnly && (
        <FormNigoMessages
            nigoExceptions={nigoExceptions}
            formNigos={upFrontNigos}
        />
    );

    // TODO: Create store and access store data from store. Wrapping OtpLayout with DiaryNotesProvider is not correct approach
    return (
        <>
            <PageHead titleKey="createCaseOft" />
            <DiaryNotesProvider caseDetails={caseDetailsData}>
                <OtpLayout
                    contractNumber={document.contract}
                    clientId={clientId as string}
                >
                    <div className={classes}>
                        <WithdrawalDrawer
                            content={transactionDetail}
                            setIsOpenOverride={setIsOpenOverride}
                            shouldOverlay={shouldOverlay}
                            isNavDrawerOpen={isNavDrawerOpen}
                        />
                        <div>
                            <header className="px-5 pt-2">
                                <Typography variant={TypographyVariant.H1}>
                                    {formTitle}
                                </Typography>
                            </header>
                            {isLoading && (
                                <div className="fixed left-0 top-0 z-10 flex h-screen w-screen justify-center bg-gray-800 opacity-80">
                                    <PageLoader
                                        variant={PageLoaderVariant.Center}
                                    />
                                </div>
                            )}
                            <article className="my-4 min-h-[390px] min-w-[275px] rounded bg-white !p-0">
                                <form className="rounded bg-white p-4 text-gray-900 md:p-6 lg:p-8">
                                    <FormProvider
                                        form={form}
                                        issueState={issueState}
                                        initialForm={initialForm}
                                        featureFlagDecisions={
                                            featureFlagDecisions
                                        }
                                        parties={parties}
                                    >
                                        {
                                            <>
                                                {formParts}
                                                {renderUpFrontNigos}
                                                <NoteSection />

                                                <FormErrors
                                                    t={t}
                                                    taskApiError={taskApiError}
                                                ></FormErrors>
                                                <FormControls
                                                    document={document}
                                                    t={t}
                                                    setIsLoading={setIsLoading}
                                                    setTaskApiError={
                                                        setTaskApiError
                                                    }
                                                ></FormControls>
                                            </>
                                        }
                                    </FormProvider>
                                </form>
                            </article>
                        </div>
                    </div>
                </OtpLayout>
            </DiaryNotesProvider>
        </>
    );
}

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            const user = await getUserData(context);
            const featureFlagDecisions: FeatureFlags =
                await optimizelyService.getFeatureFlagDecisions(
                    user.sub,
                    loggingContext
                );
            const {
                locale = DEFAULT_LOCALE,
                params,
                query,
                res,
                req,
            } = context;
            let accessToken;
            try {
                accessToken = (await getAccessToken(req, res)).accessToken;
            } catch (e) {
                logWarn('create-case/oft/:id:: Access token expired', {
                    ...parseErrorInformation(e),
                    ...loggingContext,
                });
                return serverSidePropsLogout();
            }

            const doesUserHasPagePermissions =
                await doesUserHavePagePermissions(
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

            const id = (params?.id as string) || '';
            const documentNumber = (query.doc as string) || '';
            const clientId = (query.clientId as string) || '';
            const taskId = (query.taskId as string) || '';
            const action = (query.action as string) || '';
            const getLastSaved = (query?.getLastSaved as string) || '';

            /*
            If feature flag is not enabled, redirect to error page
        */
            if (
                !isFormFeatureEnabled(
                    ProcessType.OFT,
                    clientId,
                    featureFlagDecisions
                )
            ) {
                logWarn(
                    'create-case/oft/:id::feature flag not enabled',
                    loggingContext
                );
                return {
                    redirect: {
                        destination: '/403',
                        permanent: false,
                    },
                };
            }

            const [translations, document] = await Promise.all([
                serverSideTranslations(locale, [TranslationFiles.COMMON]),
                getDocumentV2SSR(
                    documentNumber,
                    DocumentType.Oft,
                    clientId.toUpperCase(),
                    accessToken,
                    loggingContext
                ),
            ]);

            if (!document?.contract) {
                logError(
                    'create-case/oft/:id::Error getting document',
                    loggingContext
                );
                return {
                    redirect: {
                        destination: `/create-case/error?errorCode=${ERROR_CODES.DOCUMENT_RETRIEVAL}`,
                        permanent: false,
                    },
                };
            }

            const shouldShowNewExperience =
                featureFlagDecisions?.[FEATURE_FLAGS.NEW_EXP];
            const isUsedLastSaved =
                shouldShowNewExperience &&
                deStringifyTrueFalseNull(getLastSaved.toLowerCase());
            if (shouldShowNewExperience && action !== 'readonly') {
                logInfo('create-case/oft/:id:Checking NIGO', loggingContext);
                const isNigoCase = await checkNigoExistsSSR(
                    clientId.toUpperCase(),
                    document.caseId,
                    accessToken,
                    loggingContext
                );
                if (isNigoCase && !isUsedLastSaved) {
                    logInfo('create-case/oft/:id::Nigo exists for case', {
                        ...loggingContext,
                        caseId: document.caseId,
                        lob: document?.lob,
                    });
                    return {
                        redirect: {
                            destination: `/create-case/error?errorCode=${ERROR_CODES.NIGO_EXISTS}`,
                            permanent: false,
                        },
                    };
                }
            } else {
                logInfo(
                    'create-case/oft/:id:Skipping NIGO check',
                    loggingContext
                );
            }

            const form = await initializeOTPTaskSSR({
                accessToken,
                caseId: id,
                clientId,
                contractNumber: document.contract,
                documentNumber,
                taskType: TaskType.OFT,
                userId: user.name,
                getLastSaved,
                taskId: taskId,
                action: action,
                loggingContext,
            });

            if (!form) {
                logWarn(
                    'create-case/oft/id::Error initializing task oft form',
                    {
                        ...loggingContext,
                        contract: document?.contract,
                    }
                );
                return {
                    redirect: {
                        destination: `/create-case/error?errorCode=${ERROR_CODES.OFT_TASK_INITIALIZATION}`,
                        permanent: false,
                    },
                };
            }

            const isLC = !isFastFeatureEnabled(
                form?.taskType,
                featureFlagDecisions
            );

            const nigoFilters = {
                carrier: clientId?.toUpperCase(),
                process: Processes.OutgoingFundTransfer,
            };

            const nigoExceptions = await searchNigoExceptions(
                nigoFilters,
                accessToken,
                loggingContext
            );

            if (isLC) {
                const parties = document?.contract
                    ? await getPolicyPartiesSSR(
                          document?.contract,
                          clientId,
                          accessToken as string,
                          loggingContext
                      )
                    : [];
                return {
                    props: {
                        ...translations,
                        document,
                        form,
                        locale,
                        featureFlagDecisions,
                        user,
                        parties,
                        nigoExceptions,
                    },
                };
            } else {
                const policies = await searchPolicySSR(
                    document?.contract,
                    [clientId?.toUpperCase() as Carrier],
                    accessToken,
                    1,
                    0,
                    loggingContext
                );
                const planCode = policies?.[0]?.planCode || null;
                if (!planCode) {
                    logInfo(
                        'create-case/oft/:id::Plan code not found',
                        loggingContext
                    );
                    return {
                        redirect: {
                            destination: `/create-case/error?errorCode=${ERROR_CODES.RENEWAL_FORM_PLAN_CODE}`,
                            permanent: false,
                        },
                    };
                }
                logInfo('create-case/oft/:id::Plan code found', {
                    ...loggingContext,
                    planCode: planCode,
                });

                const policy = await getPolicyDetailsSsr(
                    document?.contract,
                    planCode,
                    accessToken,
                    loggingContext,
                    true
                );
                if (!policy) {
                    logInfo(
                        'create-case/oft/:id::Policy not found',
                        loggingContext
                    );
                    return {
                        redirect: {
                            destination: `/create-case/error?errorCode=${ERROR_CODES.POLICY_NOT_FOUND}`,
                            permanent: false,
                        },
                    };
                }
                logInfo(
                    'create-case/oft/:id::Policy details found',
                    loggingContext
                );

                const { parties, partyRoles = [] } = policy ?? {};

                return {
                    props: {
                        ...translations,
                        document,
                        form,
                        locale,
                        featureFlagDecisions,
                        parties: Array.isArray(parties) ? parties : [],
                        partyRoles,
                        user,
                        planCode,
                        nigoExceptions,
                    },
                };
            }
        },
    },
    {
        file: 'create-case/oft/[id]/index',
        function: 'getServerSideProps',
        page: 'create-case/oft/:id',
    }
);
