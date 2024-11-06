import { getAccessToken, withPageAuthRequired } from '@auth0/nextjs-auth0';
import clsx from 'clsx';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useEffect, useState, useMemo } from 'react';

import OtpLayout from '@deps/components/otp-layout';
import WithdrawalDrawer, { SidebarContent } from '@deps/components/otp-withdrawal-form/withdrawal-drawer';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import OftDlicForm from '@deps/containers/otp/oft-forms/dlic/dlic-oft-form';
import FlicOftWithdrawalForm from '@deps/containers/otp/oft-forms/flic/flic-oft-form';
import MassOftWithdrawalForm from '@deps/containers/otp/oft-forms/mass/mass-oft-form';
import RSLNOftWithdrawalForm from '@deps/containers/otp/oft-forms/rsln/rsln-oft-form';
import SbgcOftWithdrawalForm from '@deps/containers/otp/oft-forms/sbgc/sbgc-oft-form';
import { FormControls } from '@deps/containers/otp/withdrawal-forms/components/form-controls';
import { FormErrors } from '@deps/containers/otp/withdrawal-forms/components/form-errors';
import { FormProvider } from '@deps/containers/otp/withdrawal-forms/components/form-provider';
import { DiaryNotesProvider } from '@deps/contexts/DiaryNotesContext';
import { determineFormToRender } from '@deps/helpers/form-selector.helper';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { shouldNavbarOverlay } from '@deps/helpers/page-layout';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helper';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { deStringifyTrueFalseNull, toTitleCase } from '@deps/helpers/string.helper';
import { useAccountInfo } from '@deps/hooks/otp-withdrawal/useAccountInfo';
import { useScreenSize } from '@deps/hooks/useScreenSize';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { DocumentData, DocumentType } from '@deps/models/case/document';
import { ProcessType } from '@deps/models/case/enums';
import { TaskType } from '@deps/models/case/task';
import { ActiveWithdrawalCase, Carrier, PartyRoles, QualTypes } from '@deps/models/case/withdrawal/case';
import { UserPermission } from '@deps/models/user-profile';
import { initializeOTPTaskSSR } from '@deps/operations/tasks/v2/initialize';
import { getDocumentSSR } from '@deps/queries/api/documents';
import { checkNigoExistsSSR } from '@deps/queries/api/integration';
import { SCREEN_BREAKPOINTS } from '@deps/types/constants';
import { SegmentPageName, SegmentTrackedPageProps } from '@deps/types/segment-analytics';
import { getCarrierNameByClientId } from '@deps/utils/carriers';
import { isNonProductionEnvironment } from '@deps/utils/environment.helper';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { isFormFeatureEnabled } from '@deps/utils/optimizely/utils';
import { logError, logInfo, logWarn, parseErrorInformation } from '@deps/utils/server-logging';

import { ERROR_CODES } from '../../error';

interface OftCaseProps extends SegmentTrackedPageProps {
    document: DocumentData;
    form: ActiveWithdrawalCase;
    userId: string;
    formParts: React.ReactNode;
    featureFlagDecisions: FeatureFlags;
}

const DefaultSidebarContent = {
    contractId: '',
    documentNumber: '',
    caseId: '',
    transactions: [],
    ownerName: '',
    annuitantName: '',
};

const getFormComponentMap = (planCode: string | '', qualType: QualTypes | ''): Record<string, React.ReactNode> => ({
    [Carrier.FLIC]: <FlicOftWithdrawalForm />,
    [Carrier.MASS]: <MassOftWithdrawalForm />,
    [Carrier.SBGC]: <SbgcOftWithdrawalForm planCode={planCode} />,
    [Carrier.DLIC]: <OftDlicForm qualType={qualType} />,
    [Carrier.RSLN]: <RSLNOftWithdrawalForm qualType={qualType} />,
});

export default function OftCase({ document, form, featureFlagDecisions, user }: OftCaseProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });
    const router = useRouter();

    const { clientId, clientIdOverride } = router.query;
    const clientForFormDetermination = isNonProductionEnvironment() ? clientIdOverride || clientId : clientId;
    const { qualType, issueState, planCode } = useAccountInfo(document.contract, clientId as string);

    useSegmentPageTracker(user, SegmentPageName.OftCase, { clientId, clientIdOverride, clientForFormDetermination, documentNumber: document.documentNumber, formTaskId: form.taskId, qualType, issueState, planCode });

    const formParts = determineFormToRender(clientForFormDetermination as string, getFormComponentMap(planCode, qualType));

    if (!formParts) {
        console.error('OFTCase::No form parts', {
            documentNumber: document?.documentNumber,
            clientId,
            contract: document?.contract,
        });
        router.push(`/create-case/error?errorCode=${ERROR_CODES.OFT_FORM_CREATION}`);
    }

    const [taskApiError, setTaskApiError] = useState('');

    // Transaction Details
    const [transactionDetail, setTransactionDetail] = useState<SidebarContent>(DefaultSidebarContent);
    const isLargeScreen = useScreenSize(SCREEN_BREAKPOINTS.lg);
    const [isOpenOverride, setIsOpenOverride] = useState<null | boolean>(null);

    const [isLoading, setIsLoading] = useState(false);
    const initialForm = form;
    const ownerName =
        initialForm?.data?.formRequest?.formParty?.parties?.find(party => party.partyRoleType === PartyRoles.OWNER)?.fullName || '';
    const annuitantName =
        initialForm?.data?.formRequest?.formParty?.parties?.find(party => party.partyRoleType === PartyRoles.ANNUITANT)?.fullName || '';

    useEffect(() => {
        setTransactionDetail({
            contractId: document?.contract || '',
            documentNumber: document?.documentNumber || '',
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

    const classes = clsx('height-adjusted grid w-full', {
        'grid-cols-[52px,auto]': shouldOverlay,
        'grid-cols-[350px,auto]': !shouldOverlay,
    });

    const formTitle = t(`formTitles.oft`, { carrier: getCarrierNameByClientId(clientForFormDetermination as string) });
    const caseDetailsData = {
        clientId: clientId as string,
        policyNum: document.contract || '',
    };
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
                                    issueState={issueState}
                                    initialForm={initialForm}
                                    featureFlagDecisions={featureFlagDecisions}
                                >
                                    {
                                        <>
                                            {formParts}
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
            logWarn('create-case/oft/:id:: Access token expired', {
                ...parseErrorInformation(e),
                file: 'create-case/oft/:id/index',
                function: 'getServerSideProps',
            });
            return serverSidePropsLogout();
        }

        const doesUserHasPagePermissions = await doesUserHavePagePermissions(accessToken, user, UserPermission.AllowReadOtpRenewals);
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
        if (!isFormFeatureEnabled(ProcessType.OFT, clientId, featureFlagDecisions)) {
            logWarn('create-case/oft/:id::feature flag not enabled', { documentNumber, clientId });
            return {
                redirect: {
                    destination: '/403',
                    permanent: false,
                },
            };
        }

        const [translations, document] = await Promise.all([
            serverSideTranslations(locale, [TranslationFiles.COMMON]),
            getDocumentSSR(documentNumber, DocumentType.Oft, clientId.toUpperCase(), accessToken),
        ]);

        if (!document?.contract) {
            logError('create-case/oft/:id::Error getting document', {
                documentNumber,
                clientId,
                id,
                file: 'create-case/oft/:id/index',
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
            logInfo('create-case/withdrawal/:id:Checking NIGO', { taskId, action, documentNumber, id, clientId });
            const isNigoCase = await checkNigoExistsSSR(clientId.toUpperCase(), document.caseId, accessToken);
            if (isNigoCase && !isUsedLastSaved) {
                logInfo('create-case/oft/:id::Nigo exists for case', {
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
            logInfo('create-case/oft/:id:Skipping NIGO check', { taskId, action, documentNumber, id, clientId });
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
        });

        if (!form) {
            logWarn('create-case/oft/id::Error initializing task oft form', {
                documentNumber,
                clientId,
                contract: document?.contract,
                file: 'create-case/oft/:id/index',
                function: 'getServerSideProps',
            });
            return {
                redirect: {
                    destination: `/create-case/error?errorCode=${ERROR_CODES.OFT_TASK_INITIALIZATION}`,
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
                user,
            },
        };
    },
});
