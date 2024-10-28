/* eslint-disable import/order */
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
import { SbgcSSWForm } from '@deps/containers/otp/ssw-forms/sbgc/sbgc-ssw-form';
import { FormControls } from '@deps/containers/otp/withdrawal-forms/components/form-controls';
import { FormErrors } from '@deps/containers/otp/withdrawal-forms/components/form-errors';
import { FormProvider } from '@deps/containers/otp/withdrawal-forms/components/form-provider';
import { DiaryNotesProvider } from '@deps/contexts/DiaryNotesContext';
import { isNonProductionEnvironment } from '@deps/utils/environment.helper';
import { determineFormToRender } from '@deps/helpers/form-selector.helper';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { shouldNavbarOverlay } from '@deps/helpers/page-layout';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helper';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { deStringifyTrueFalseNull } from '@deps/helpers/string.helper';
import { useAccountInfo } from '@deps/hooks/otp-withdrawal/useAccountInfo';
import { useScreenSize } from '@deps/hooks/useScreenSize';
import { DocumentData, DocumentType } from '@deps/models/case/document';
import { ProcessType } from '@deps/models/case/enums';
import { LifeCadParty } from '@deps/models/case/lifecad-party';
import { TaskType } from '@deps/models/case/task';
import { ActiveWithdrawalCase, Carrier, QualTypes, Transaction, TransactionStatus } from '@deps/models/case/withdrawal/case';
import { UserPermission } from '@deps/models/user-profile';
import { initializeOTPTaskSSR } from '@deps/operations/tasks/v2/initialize';
import { getDocumentSSR } from '@deps/queries/api/documents';
import { checkNigoExistsSSR } from '@deps/queries/api/integration';
import { getPolicyPartiesSSR } from '@deps/queries/api/policies';
import { SCREEN_BREAKPOINTS } from '@deps/types/constants';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { isFormFeatureEnabled } from '@deps/utils/optimizely/utils';
import { logError, logInfo, logWarn } from '@deps/utils/server-logging';

import { ERROR_CODES } from '../../error';
import { MassMutualSSWForm } from '@deps/containers/otp/ssw-forms/mass/mass-ssw-form';
import { NassauSSWForm } from '@deps/containers/otp/ssw-forms/nasu/nasu-ssw-form';
import { CarrierToCarrierTitleMap } from '@deps/constants/page-title';
import { FlicSSWForm } from '@deps/containers/otp/ssw-forms/flic/flic-ssw-form';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { SegmentPageName, SegmentTrackedPageProps } from '@deps/types/segment-analytics';

interface SSWCaseProps extends SegmentTrackedPageProps {
    document: DocumentData;
    form: ActiveWithdrawalCase;
    userId: string;
    transactionsHistory?: Transaction[];
    formParts: React.ReactNode;
    parties: LifeCadParty[];
    // TODO MG: put this in an interface for FeatureFlags that each page needing it can just extend
    featureFlagDecisions: FeatureFlags;
}

// Return the first 5 transactions that are either done or pending
export const getFilteredTransactions = (transactions: Transaction[]) => {
    const condition = (record: Transaction) => [TransactionStatus.Done, 'Pending' as TransactionStatus].includes(record.Status);
    return transactions
        .filter(condition)
        .sort((a, b) => b.TransactionDate.localeCompare(a.TransactionDate))
        .slice(0, 5);
};

const DefaultSidebarContent = {
    contractId: '',
    documentNumber: '',
    caseId: '',
    transactions: [],
};

const getFormComponentMap = (qualType: QualTypes | ''): Record<string, React.ReactNode> => ({
    [Carrier.SBGC]: <SbgcSSWForm />,
    [Carrier.MASS]: <MassMutualSSWForm qualType={qualType} />,
    [Carrier.NASU]: <NassauSSWForm />,
    [Carrier.FLIC]: <FlicSSWForm qualType={qualType} />,
});

export default function SSWCase({ document, form, parties, transactionsHistory, featureFlagDecisions, user }: SSWCaseProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseSSW.request' });

    // TODO: Need to map this from common portion whenever we will restructure i18 files
    const { t: withdrawalTx } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });
    const router = useRouter();

    const { clientId, clientIdOverride } = router.query;
    const clientForFormDetermination = isNonProductionEnvironment() ? clientIdOverride || clientId : clientId;

    useSegmentPageTracker(user, SegmentPageName.SswCase, { documentNumber: document.documentNumber, formTaskId: form.taskId, clientId, clientIdOverride });

    const isLargeScreen = useScreenSize(SCREEN_BREAKPOINTS.lg);
    const { issueState, qualType, issueDate } = useAccountInfo(document.contract, clientId as string);
    const [transactionDetail, setTransactionDetail] = useState<SidebarContent>(DefaultSidebarContent);
    const [isOpenOverride, setIsOpenOverride] = useState<null | boolean>(null);
    const [taskApiError, setTaskApiError] = useState('');
    const [loading, setLoading] = useState(false);
    const initialForm = form;
    const formParts = determineFormToRender(clientForFormDetermination as string, getFormComponentMap(qualType));

    if (!formParts) {
        console.error('SSWCase::No form parts', {
            documentNumber: document?.documentNumber,
            clientId,
            contract: document?.contract,
        });
        router.push(`/create-case/error?errorCode=${ERROR_CODES.SSW_FORM_CREATION}`);
    }

    useEffect(() => {
        setTransactionDetail({
            contractId: document?.contract || '',
            documentNumber: document?.documentNumber || '',
            caseId: form.caseId || '',
            transactions: transactionsHistory,
            qualType,
            issueDate,
        });
    }, [qualType, document, form, transactionsHistory, clientId, issueDate]);

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

    const carrier = (clientForFormDetermination as string).toUpperCase();
    const carrierMappedText = CarrierToCarrierTitleMap[carrier];
    const carrierTitle = carrierMappedText ? carrierMappedText : carrier;
    const formTitle = carrierTitle ? t('formTitles.standard', { carrier: carrierTitle }) : t(`formTitles.defaultTitle`);

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
                        {loading && (
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
                                    parties={parties}
                                    featureFlagDecisions={featureFlagDecisions}
                                >
                                    {
                                        <>
                                            {formParts}
                                            <FormErrors t={withdrawalTx} taskApiError={taskApiError}></FormErrors>
                                            <FormControls
                                                document={document}
                                                t={withdrawalTx}
                                                isLoading={loading}
                                                setIsLoading={setLoading}
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
            logWarn('Access token expired', { error: e, file: 'create-case/ssw/:id/index', function: 'getServerSideProps' });
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
        const action = (query.action as string) || '';
        const taskId = (query.taskId as string) || '';
        const getLastSaved = (query?.getLastSaved as string) || '';

        // If feature flag is not enabled, redirect to error page
        if (!isFormFeatureEnabled(ProcessType.SSW, clientId, featureFlagDecisions)) {
            logWarn('create-case/ssw/:id::feature flag not enabled', { documentNumber, clientId });
            return {
                redirect: {
                    destination: '/403',
                    permanent: false,
                },
            };
        }

        const [translations, document] = await Promise.all([
            serverSideTranslations(locale, [TranslationFiles.COMMON]),
            getDocumentSSR(documentNumber, DocumentType.SSW, clientId.toUpperCase(), accessToken),
        ]);
        if (!document?.contract) {
            logError('create-case/ssw/:id::Error getting document', { documentNumber, clientId });
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
            logInfo('create-case/ssw/:id:Checking NIGO', { taskId, action, documentNumber, id, clientId });
            const isNigoCase = await checkNigoExistsSSR(clientId.toUpperCase(), document.caseId, accessToken);
            if (isNigoCase && !isUsedLastSaved) {
                logInfo('create-case/ssw/:id::Nigo exists for case', {
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
            logInfo('create-case/ssw/:id:Skipping NIGO check', { taskId, action, documentNumber, id, clientId });
        }
        const form = await initializeOTPTaskSSR({
            accessToken,
            caseId: id,
            clientId,
            contractNumber: document.contract,
            documentNumber,
            userId: user.name,
            taskType: TaskType.SSW,
            getLastSaved,
            taskId: taskId,
            action: action,
        });
        if (!form) {
            logError('create-case/SSW/:id::Error initializing task ssw form', {
                documentNumber,
                clientId,
                contract: document?.contract,
            });
            return {
                redirect: {
                    destination: `/create-case/error?errorCode=${ERROR_CODES.SSW_TASK_INITIALIZATION}`,
                    permanent: false,
                },
            };
        }

        const parties = document?.contract ? await getPolicyPartiesSSR(document?.contract, clientId, accessToken as string) : [];

        return {
            props: {
                ...translations,
                document,
                form,
                locale,
                transactionsHistory: null,
                parties: Array.isArray(parties) ? parties : [],
                featureFlagDecisions,
                user,
            },
        };
    },
});
