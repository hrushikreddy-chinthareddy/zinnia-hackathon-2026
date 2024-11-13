import { getAccessToken, withPageAuthRequired } from '@auth0/nextjs-auth0';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useEffect, useState, useMemo } from 'react';

import AssistiveText, { AssistiveTextVariant } from '@deps/components/assistive-text/assistive-text';
import OtpLayout from '@deps/components/otp-layout';
import WithdrawalDrawer, { SidebarContent } from '@deps/components/otp-withdrawal-form/withdrawal-drawer';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { FormControls } from '@deps/containers/otp/withdrawal-forms/components/form-controls';
import { FormErrors } from '@deps/containers/otp/withdrawal-forms/components/form-errors';
import { FormProvider } from '@deps/containers/otp/withdrawal-forms/components/form-provider';
import DlicWithdrawalForm from '@deps/containers/otp/withdrawal-forms/dlic/dlic-withdrawal-form';
import FlicWithdrawalForm from '@deps/containers/otp/withdrawal-forms/flic-withdrawal-form';
import GdmnWithdrawalForm from '@deps/containers/otp/withdrawal-forms/gdmn/gdmn-withdrawal-form';
import MassWithdrawalForm from '@deps/containers/otp/withdrawal-forms/mass/mass-withdrawal-form';
import NasuWithdrawalForm from '@deps/containers/otp/withdrawal-forms/nasu/nasu-withdrawal-form';
import RslnWithdrawalForm from '@deps/containers/otp/withdrawal-forms/rsln/rsln-withdrawal-form';
import SbgcWithdrawalForm from '@deps/containers/otp/withdrawal-forms/sbgc-withdrawal-form';
import { DiaryNotesProvider } from '@deps/contexts/DiaryNotesContext';
import { determineFormToRender } from '@deps/helpers/form-selector.helper';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { shouldNavbarOverlay } from '@deps/helpers/page-layout';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helper';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { deStringifyTrueFalseNull } from '@deps/helpers/string.helper';
import { TransactionType, TypeDesc, useTransactionsHistory } from '@deps/hooks/otp-withdrawal/transaction-history';
import { useAccountInfo } from '@deps/hooks/otp-withdrawal/useAccountInfo';
import { useScreenSize } from '@deps/hooks/useScreenSize';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { DocumentData, DocumentType } from '@deps/models/case/document';
import { ProcessType } from '@deps/models/case/enums';
import { LifeCadParty } from '@deps/models/case/lifecad-party';
import { TaskType } from '@deps/models/case/task';
import { ActiveWithdrawalCase, Carrier, QualTypes, TransactionStatus, SortOrder } from '@deps/models/case/withdrawal/case';
import { UserPermission } from '@deps/models/user-profile';
import { initializeOTPTaskSSR } from '@deps/operations/tasks/v2/initialize';
import { getDocumentSSR } from '@deps/queries/api/documents';
import { checkNigoExistsSSR } from '@deps/queries/api/integration';
import { getPolicyPartiesSSR } from '@deps/queries/api/policies';
import { SCREEN_BREAKPOINTS, ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import { SegmentPageName, SegmentTrackedPageProps } from '@deps/types/segment-analytics';
import { isNonProductionEnvironment } from '@deps/utils/environment.helper';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { isFormFeatureEnabled } from '@deps/utils/optimizely/utils';
import { logError, logInfo, logWarn, parseErrorInformation } from '@deps/utils/server-logging';

import { ERROR_CODES } from '../../error';

interface WithdrawalCaseProps extends SegmentTrackedPageProps {
    document: DocumentData;
    form: ActiveWithdrawalCase;
    userId: string;
    formParts: React.ReactNode;
    isNigoCase?: boolean;
    featureFlagDecisions: FeatureFlags;
    parties: LifeCadParty[];
}

const DefaultSidebarContent = {
    contractId: '',
    documentNumber: '',
    caseId: '',
    transactions: [],
};

const getFormComponentMap = (qualType: QualTypes | ''): Record<string, React.ReactNode> => ({
    [Carrier.FLIC]: <FlicWithdrawalForm />,
    [Carrier.SBGC]: <SbgcWithdrawalForm />,
    [Carrier.DLIC]: <DlicWithdrawalForm />,
    [Carrier.MASS]: <MassWithdrawalForm qualType={qualType} />,
    [Carrier.NASU]: <NasuWithdrawalForm />,
    [Carrier.GDMN]: <GdmnWithdrawalForm />,
    [Carrier.RSLN]: <RslnWithdrawalForm />,
});

export default function WithdrawalCase({ document, form, isNigoCase, featureFlagDecisions, parties, user }: WithdrawalCaseProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });
    const router = useRouter();
    const { clientId, clientIdOverride, getLastSaved } = router.query;
    const clientForFormDetermination = isNonProductionEnvironment() ? clientIdOverride || clientId : clientId;
    const isLargeScreen = useScreenSize(SCREEN_BREAKPOINTS.lg);
    const { issueState, qualType, issueDate } = useAccountInfo(document.contract, clientId as string);
    const showTransactions = featureFlagDecisions?.[FEATURE_FLAGS.TRANSACTION_HISTORY];

    const { transactions } = useTransactionsHistory({
        contract: document.contract,
        clientId: clientId as string,
        typeDesc: TypeDesc.Withdrawal,
        transactionType: TransactionType.Withdrawals,
        fromDate: dayjs(document.documentDate).format(ZAHARA_API_DATE_FORMAT),
        filter: { count: 5, sortBy: SortOrder.Desc, statuses: [TransactionStatus.Done, TransactionStatus.Pending] },
    });

    useSegmentPageTracker(user, SegmentPageName.WithdrawalCase, {
        documentNumber: document.documentNumber,
        formTaskId: form.taskId,
        transactions: JSON.stringify(transactions),
    });

    const [transactionDetail, setTransactionDetail] = useState<SidebarContent>(DefaultSidebarContent);
    const [isOpenOverride, setIsOpenOverride] = useState<null | boolean>(null);
    const [taskApiError, setTaskApiError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const initialForm = form;
    const isLastSaved = deStringifyTrueFalseNull(((getLastSaved as string) || '').toLowerCase());
    const shouldShowNewExperience = featureFlagDecisions?.[FEATURE_FLAGS.NEW_EXP];
    const isUsedLastSaved = shouldShowNewExperience && isLastSaved;

    const formParts = determineFormToRender(clientForFormDetermination as string, getFormComponentMap(qualType));
    if (!formParts) {
        console.error('WithdrawalCase::No form parts', {
            documentNumber: document?.documentNumber,
            clientId,
            contract: document?.contract,
            isNonProdEnv: isNonProductionEnvironment(),
        });
        router.push(`/create-case/error?errorCode=${ERROR_CODES.WITHDRAWAL_FORM_CREATION}`);
    }

    useEffect(() => {
        setTransactionDetail({
            contractId: document?.contract || '',
            documentNumber: document?.documentNumber || '',
            contractValue: document?.contractValue || '',
            contractStatusCode: document?.contractStatusCode || '',
            caseId: form.caseId || '',
            transactions: showTransactions ? transactions : [],
            qualType,
            issueDate,
        });
    }, [qualType, document, form, transactions, clientId, issueDate]);

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

    const formTitle = clientId ? t(`formTitles.${(clientId as string).toLowerCase()}`) : t(`formTitles.defaultTitle`);

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
                                    isOpenNigo={(isUsedLastSaved as boolean) && isNigoCase}
                                    featureFlagDecisions={featureFlagDecisions}
                                    parties={parties}
                                >
                                    {
                                        <>
                                            {isUsedLastSaved && isNigoCase && (
                                                <div className="flex flex-col">
                                                    <AssistiveText
                                                        text={t('openNigoExists')}
                                                        variant={AssistiveTextVariant.Error}
                                                        className="mt-2"
                                                    />
                                                </div>
                                            )}
                                            {formParts}
                                            <FormErrors t={t} taskApiError={taskApiError}></FormErrors>
                                            <FormControls
                                                document={document}
                                                t={t}
                                                isLoading={isLoading}
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
            logWarn('Access token expired', {
                ...parseErrorInformation(e),
                file: 'create-case/withdrawal/:id/index',
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
        const getLastSaved = (query?.getLastSaved as string) || '';
        const taskId = (query.taskId as string) || '';
        const action = (query.action as string) || '';

        const [translations, document] = await Promise.all([
            serverSideTranslations(locale, [TranslationFiles.COMMON]),
            getDocumentSSR(documentNumber, DocumentType.Redemption, clientId.toUpperCase(), accessToken),
        ]);
        if (!document?.contract) {
            logError('create-case/withdrawal/:id::Error getting document', { documentNumber, clientId });
            return {
                redirect: {
                    destination: `/create-case/error?errorCode=${ERROR_CODES.DOCUMENT_RETRIEVAL}`,
                    permanent: false,
                },
            };
        }

        let isNigoCase = false;
        const shouldShowNewExperience = featureFlagDecisions?.[FEATURE_FLAGS.NEW_EXP];
        const isUsedLastSaved = shouldShowNewExperience && deStringifyTrueFalseNull(getLastSaved.toLowerCase());
        if (shouldShowNewExperience && action !== 'readonly') {
            logInfo('create-case/withdrawal/:id:Checking NIGO', { taskId, action, documentNumber, id, clientId });
            isNigoCase = await checkNigoExistsSSR(clientId.toUpperCase(), document.caseId, accessToken);

            if (isNigoCase && !isUsedLastSaved) {
                if (action !== 'readonly') {
                    logInfo('create-case/withdrawal/:id::Nigo exists for case', {
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
            }
        } else {
            logInfo('create-case/withdrawal/:id:Skipping NIGO check', { taskId, action, documentNumber, id, clientId });
        }
        // If feature flag is not enabled, redirect to error page
        if (!isFormFeatureEnabled(ProcessType.WITHDRAWAL, clientId, featureFlagDecisions)) {
            logWarn('create-case/withdrawal/:id::feature flag not enabled', { documentNumber, clientId });
            return {
                redirect: {
                    destination: '/403',
                    permanent: false,
                },
            };
        }

        const form = await initializeOTPTaskSSR({
            accessToken,
            caseId: id,
            clientId,
            contractNumber: document.contract,
            documentNumber,
            userId: user.name,
            taskType: TaskType.Withdrawal,
            getLastSaved,
            taskId: taskId,
            action: action,
        });

        const parties = document?.contract ? await getPolicyPartiesSSR(document?.contract, clientId, accessToken as string) : [];

        if (!form) {
            logError('create-case/withdrawal/:id::Error initializing task withdrawal form', {
                documentNumber,
                clientId,
                contract: document?.contract,
            });
            return {
                redirect: {
                    destination: `/create-case/error?errorCode=${ERROR_CODES.WITHDRAWAL_TASK_INITIALIZATION}`,
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
                isNigoCase,
                featureFlagDecisions,
                parties: Array.isArray(parties) ? parties : [],
                user,
            },
        };
    },
});
