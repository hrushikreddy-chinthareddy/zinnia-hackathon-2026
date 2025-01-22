import { getAccessToken, withPageAuthRequired } from '@auth0/nextjs-auth0';
import clsx from 'clsx';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useEffect, useState, useMemo } from 'react';

import OtpLayout from '@deps/components/otp-layout';
import NoteSection from '@deps/components/otp-withdrawal-form/note-section';
import WithdrawalDrawer, { SidebarContent } from '@deps/components/otp-withdrawal-form/withdrawal-drawer';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import FlicRmdWithdrawalForm from '@deps/containers/otp/rmd-forms/flic-rmd-form';
import GlcoRmdWithdrawalForm from '@deps/containers/otp/rmd-forms/glco-rmd-form';
import MassMutualRmdWithdrawalForm from '@deps/containers/otp/rmd-forms/mm-rmd-form';
import SbgcRmdWithdrawalForm from '@deps/containers/otp/rmd-forms/sbgc-rmd-form';
import UlpcRmdWithdrawalForm from '@deps/containers/otp/rmd-forms/ulpc/ulpc-rmd-form';
import { FormControls } from '@deps/containers/otp/withdrawal-forms/components/form-controls';
import { FormErrors } from '@deps/containers/otp/withdrawal-forms/components/form-errors';
import { FormProvider } from '@deps/containers/otp/withdrawal-forms/components/form-provider';
import { DiaryNotesProvider } from '@deps/contexts/DiaryNotesContext';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { shouldNavbarOverlay } from '@deps/helpers/page-layout';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helper';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { deStringifyTrueFalseNull } from '@deps/helpers/string.helper';
import { useAccountInfo } from '@deps/hooks/otp-withdrawal/useAccountInfo';
import { useScreenSize } from '@deps/hooks/useScreenSize';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { DocumentData, DocumentType } from '@deps/models/case/document';
import { LifeCadParty } from '@deps/models/case/lifecad-party';
import { TaskType } from '@deps/models/case/task';
import { ActiveWithdrawalCase, Carrier, QualTypes } from '@deps/models/case/withdrawal/case';
import { UserPermission } from '@deps/models/user-profile';
import { initializeOTPTaskSSR } from '@deps/operations/tasks/v2/initialize';
import { getDocumentV2SSR } from '@deps/queries/api/documents';
import { checkNigoExistsSSR } from '@deps/queries/api/integration';
import { getPolicyPartiesSSR } from '@deps/queries/api/policies';
import { SCREEN_BREAKPOINTS } from '@deps/types/constants';
import { SegmentPageName, SegmentTrackedPageProps } from '@deps/types/segment-analytics';
import { isNonProductionEnvironment } from '@deps/utils/environment.helper';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { logError, logInfo, logWarn, parseErrorInformation } from '@deps/utils/server-logging';

import { ERROR_CODES } from '../../error';

interface RmdCaseProps extends SegmentTrackedPageProps {
    document: DocumentData;
    form: ActiveWithdrawalCase;
    userId: string;
    formParts: React.ReactNode;
    featureFlagDecisions: FeatureFlags;
    parties: LifeCadParty[];
}

const DefaultSidebarContent = {
    contractId: '',
    documentNumber: '',
    caseId: '',
    transactions: [],
};

const determineFormToRender = (clientId: string, qualType: QualTypes | ''): React.ReactNode => {
    switch (clientId.toUpperCase()) {
        case Carrier.FLIC:
            return <FlicRmdWithdrawalForm />;
        case Carrier.MASS:
            return <MassMutualRmdWithdrawalForm qualType={qualType} />;
        case Carrier.SBGC:
            return <SbgcRmdWithdrawalForm />;
        case Carrier.GLCO:
            return <GlcoRmdWithdrawalForm />;
        case Carrier.ULPC:
            return <UlpcRmdWithdrawalForm />;
        default:
            console.error('determineFormToRender::unsupported clientId', clientId);
            return null;
    }
};

// The RMD Withdrawal form uses the same APIs and payloads, and many of the same components as the standard Withdrawal Form.
export default function RmdCase({ document, form, featureFlagDecisions, parties, user }: RmdCaseProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });
    const router = useRouter();
    const initialForm = form;

    const { clientId, clientIdOverride } = router.query;
    const clientForFormDetermination = isNonProductionEnvironment() ? clientIdOverride || clientId : clientId;
    // get the contract issue type from custom hook
    const { issueState, issueDate, qualType } = useAccountInfo(document.contract, clientId as string);

    useSegmentPageTracker(user, SegmentPageName.RmdCase, {
        clientForFormDetermination,
        clientId,
        clientIdOverride,
        documentNumber: document.documentNumber,
        formTaskId: form.taskId,
        issueState,
        issueDate,
        qualType,
    });

    const formParts = determineFormToRender(clientForFormDetermination as string, qualType);
    if (!formParts) {
        console.error('RmdCase::No form parts', {
            documentNumber: document?.documentNumber,
            clientId,
            contract: document?.contract,
        });
        router.push(`/create-case/error?errorCode=${ERROR_CODES.RMD_FORM_CREATION}`);
    }

    const [taskApiError, setTaskApiError] = useState('');

    // Transaction Details
    const [transactionDetail, setTransactionDetail] = useState<SidebarContent>(DefaultSidebarContent);

    const isLargeScreen = useScreenSize(SCREEN_BREAKPOINTS.lg);

    // Sidebar metadata
    const [isOpenOverride, setIsOpenOverride] = useState<null | boolean>(null);

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setTransactionDetail({
            contractId: document?.contract || '',
            documentNumber: document?.documentNumber || '',
            contractValue: document?.contractValue || '',
            contractStatusCode: document?.contractStatusCode || '',
            caseId: form.caseId || '',
            issueDate,
            qualType,
        });
    }, [qualType, document, form, issueDate]);

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

    const classes = clsx('height-adjusted grid w-full', {
        'grid-cols-[52px,auto]': shouldOverlay,
        'grid-cols-[350px,auto]': !shouldOverlay,
    });

    const caseDetailsData = {
        clientId: clientId as string,
        policyNum: document.contract || '',
    };

    const formTitle = t(`formTitles.rmd`);
    // TODO: Create store and access store data from store. Wrapping OtpLayout with DiaryNotesProvider is not correct approach
    return (
        <DiaryNotesProvider caseDetails={caseDetailsData}>
            <OtpLayout contractNumber={document.contract} clientId={clientId as string}>
                <div className={classes}>
                    <WithdrawalDrawer
                        content={transactionDetail}
                        setIsOpenOverride={setIsOpenOverride}
                        shouldOverlay={shouldOverlay}
                        isNavDrawerOpen={isNavDrawerOpen}
                    />
                    <div>
                        <header className="px-5 pt-2">
                            <Typography variant={TypographyVariant.H1}>{formTitle}</Typography>
                        </header>
                        {isLoading && (
                            <div className="fixed left-0 top-0 z-10 flex h-screen w-screen justify-center bg-gray-800 opacity-80">
                                <PageLoader variant={PageLoaderVariant.Center} />
                            </div>
                        )}
                        <article className="my-4 min-h-[390px] min-w-[275px] rounded bg-white !p-0 shadow-sm">
                            <form className="rounded bg-white p-4 text-gray-900 md:p-6 lg:p-8">
                                <FormProvider
                                    form={form}
                                    initialForm={initialForm}
                                    issueState={issueState}
                                    featureFlagDecisions={featureFlagDecisions}
                                    parties={parties}
                                >
                                    {
                                        <>
                                            {formParts}
                                            <NoteSection />
                                            <FormErrors t={t} taskApiError={taskApiError}></FormErrors>
                                            <FormControls
                                                document={document}
                                                t={t}
                                                setIsLoading={setIsLoading}
                                                setTaskApiError={setTaskApiError}
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
    );
}

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: async (context: GetServerSidePropsContext) => {
        const user = await getUserData(context);
        const featureFlagDecisions: FeatureFlags = await optimizelyService.getFeatureFlagDecisions(user.sub);
        const { locale = DEFAULT_LOCALE, params, query, res, req } = context;
        let accessToken;
        try {
            accessToken = (await getAccessToken(req, res)).accessToken;
        } catch (e) {
            logWarn('create-case/rmd/:id:: Access token expired', {
                ...parseErrorInformation(e),
                file: 'create-case/rmd/:id/index',
                function: 'getServerSideProps',
            });
            return serverSidePropsLogout();
        }

        const doesUserHasPagePermissions = doesUserHavePagePermissions(accessToken, user, UserPermission.AllowReadOtpRenewals);
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

        const [translations, document] = await Promise.all([
            serverSideTranslations(locale, [TranslationFiles.COMMON]),
            getDocumentV2SSR(documentNumber, DocumentType.Rmd, clientId.toUpperCase(), accessToken),
        ]);

        if (!document?.contract) {
            logError('create-case/rmd/:id::Error getting document', {
                documentNumber,
                clientId,
                file: 'rmd/:id/index',
                function: 'getServerSideProps',
            });
            return {
                redirect: {
                    destination: `/create-case/error?errorCode=${ERROR_CODES.DOCUMENT_RETRIEVAL}`,
                    permanent: false,
                },
            };
        }

        const shouldShowNewExperience = featureFlagDecisions?.[FEATURE_FLAGS.NEW_EXP];
        const isUsedLastSaved = shouldShowNewExperience && deStringifyTrueFalseNull(getLastSaved.toLowerCase());
        if (shouldShowNewExperience && action !== 'readonly') {
            logInfo('create-case/rmd/:id:Checking NIGO', { taskId, action, documentNumber, id, clientId });
            const isNigoCase = await checkNigoExistsSSR(clientId.toUpperCase(), document.caseId, accessToken);
            if (isNigoCase && !isUsedLastSaved) {
                logInfo('create-case/rmd/:id::Nigo exists for case', {
                    documentNumber,
                    clientId,
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
            logInfo('create-case/rmd/:id:Skipping NIGO check', { taskId, action, documentNumber, id, clientId });
        }

        const form = await initializeOTPTaskSSR({
            accessToken,
            caseId: id,
            clientId,
            contractNumber: document.contract,
            documentNumber,
            taskType: TaskType.RMD,
            userId: user.name,
            getLastSaved,
            taskId: taskId,
            action: action,
        });
        const parties = document?.contract ? await getPolicyPartiesSSR(document?.contract, clientId, accessToken as string) : [];

        if (!form) {
            logError('create-case/rmd/id::Error initializing task rmd form', {
                documentNumber,
                clientId,
                contract: document?.contract,
                file: 'rmd/:id/index',
                function: 'getServerSideProps',
            });
            return {
                redirect: {
                    destination: `/create-case/error?errorCode=${ERROR_CODES.RMD_TASK_INITIALIZATION}`,
                    permanent: false,
                },
            };
        }
        return {
            props: {
                ...translations,
                document,
                form,
                locale,
                featureFlagDecisions,
                parties: Array.isArray(parties) ? parties : [],
                user,
            },
        };
    },
});
