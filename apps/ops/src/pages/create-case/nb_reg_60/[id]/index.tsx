import { getAccessToken, withPageAuthRequired } from '@auth0/nextjs-auth0';
import clsx from 'clsx';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useMemo, useState } from 'react';

import OtpLayout from '@deps/components/otp-layout';
import WithdrawalDrawer, { SidebarContent } from '@deps/components/otp-withdrawal-form/withdrawal-drawer';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import { TranslationFiles } from '@deps/config/translations';
import { FormControls } from '@deps/containers/otp/reg60-forms/components/form-controls';
import { FormErrors } from '@deps/containers/otp/reg60-forms/components/form-errors';
import MassMutualReg60Form from '@deps/containers/otp/reg60-forms/mass-mutual/mass-mutual-reg60-form';
import { FormProvider } from '@deps/containers/otp/reg60-forms/reg60-form-provider';
import { CreateReg60CaseProps } from '@deps/containers/otp/reg60-forms/reg60.types';
import { DefaultSidebarContent } from '@deps/containers/otp/reg60-forms/utils/reg60-constants';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { shouldNavbarOverlay } from '@deps/helpers/page-layout';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helper';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { useAccountInfo } from '@deps/hooks/otp-withdrawal/useAccountInfo';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { DocumentData, DocumentType } from '@deps/models/case/document';
import { Carrier } from '@deps/models/case/withdrawal/case';
import { UserPermission } from '@deps/models/user-profile';
import { getDocumentSSR } from '@deps/queries/api/documents';
import { getCaseTaskByIdSSR } from '@deps/queries/api/v2/task';
import { SCREEN_BREAKPOINTS } from '@deps/types/constants';
import { SegmentPageName } from '@deps/types/segment-analytics';
import { isNonProductionEnvironment } from '@deps/utils/environment.helper';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { logError, logInfo, logWarn, parseErrorInformation } from '@deps/utils/server-logging';

import { ERROR_CODES } from '../../error';

const determineFormToRender = (clientId: string, document: DocumentData): React.ReactNode => {
    switch (clientId.toUpperCase()) {
        case Carrier.MASS:
            return <MassMutualReg60Form document={document} />;
        default:
            console.error('determineFormToRender::unsupported clientId', clientId);
            return null;
    }
};

export default function Reg60({ document, form, transactionsHistory, user }: CreateReg60CaseProps) {
    const router = useRouter();
    const { clientId, clientIdOverride, id } = router.query;
    const clientForFormDetermination = isNonProductionEnvironment() ? clientIdOverride || clientId : clientId;

    useSegmentPageTracker(user, SegmentPageName.Reg60, {
        clientId,
        clientForFormDetermination,
        clientIdOverride,
        documentNumber: document.documentNumber,
        formId: form.id,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [taskApiError, setTaskApiError] = useState('');

    const formParts = determineFormToRender(clientForFormDetermination as string, document);
    if (!formParts) {
        logError('NBReg60Case::No form parts', {
            documentNumber: document?.documentNumber,
            clientId,
            contract: document?.contract,
        });
        router.push(`/create-case/error?errorCode=${ERROR_CODES.NB_REG60_FORM_CREATION}`);
    }

    // Sidebar metadata
    const [isLargeScreen, setIsLargeScreen] = useState(false); // isLargeScreen true means screen width is >= 1025
    const [isOpenOverride, setIsOpenOverride] = useState<null | boolean>(null);
    const [transactionDetail, setTransactionDetail] = useState<SidebarContent>(DefaultSidebarContent);

    // get the contract issue type from custom hook
    const { qualType, issueDate } = useAccountInfo(document?.contract, clientId as string);

    // Set state on mount
    useEffect(() => {
        if (window.innerWidth >= SCREEN_BREAKPOINTS.lg) {
            setIsLargeScreen(true);
        } else {
            setIsLargeScreen(false);
        }
    }, []);

    useEffect(() => {
        setTransactionDetail({
            contractId: document?.contract || '',
            documentNumber: document?.documentNumber || '',
            contractValue: document?.contractValue || '',
            contractStatusCode: document?.contractStatusCode || '',
            caseId: form?.caseId || (id as string),
            transactions: transactionsHistory,
            qualType,
            issueDate,
        });
    }, [qualType, document, form, transactionsHistory, clientId, issueDate, id]);

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

    return (
        <OtpLayout clientId={clientId as string} contractNumber={document?.contract}>
            <div className={classes}>
                <WithdrawalDrawer
                    content={transactionDetail}
                    setIsOpenOverride={setIsOpenOverride}
                    shouldOverlay={shouldOverlay}
                    isNavDrawerOpen={isNavDrawerOpen}
                />
                <div>
                    {isLoading && (
                        <div className="fixed left-0 top-0 z-10 flex h-screen w-screen justify-center bg-gray-800 opacity-80">
                            <PageLoader variant={PageLoaderVariant.Center} />
                        </div>
                    )}
                    <article className="my-4 min-h-[390px] min-w-[275px] rounded bg-white !p-0 shadow-sm">
                        <form className="rounded bg-white p-4 text-gray-900 md:p-6 lg:p-8">
                            <FormProvider form={form}>
                                {
                                    <>
                                        {formParts}
                                        <FormErrors taskApiError={taskApiError} />
                                        <FormControls
                                            document={document}
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
    );
}

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: async (context: GetServerSidePropsContext) => {
        const user = await getUserData(context);
        const featureFlagDecisions: FeatureFlags = await optimizelyService.getFeatureFlagDecisions(user.sub);
        const shouldShowReg60Page = featureFlagDecisions?.[FEATURE_FLAGS.REG_60];
        const { locale = DEFAULT_LOCALE, query, res, req } = context;
        let accessToken;
        let form;
        try {
            accessToken = (await getAccessToken(req, res)).accessToken;
        } catch (e) {
            logWarn('create-case/nb_reg_60/:id:: Access token expired', {
                ...parseErrorInformation(e),
                file: 'create-case/nb_reg_60/:id/index',
                function: 'getServerSideProps',
            });
            return serverSidePropsLogout();
        }

        const doesUserHasPagePermissions = await doesUserHavePagePermissions(accessToken, user, UserPermission.AllowReadOtpRenewals);
        if (!doesUserHasPagePermissions || !shouldShowReg60Page) {
            return {
                redirect: {
                    destination: '/403',
                    permanent: false,
                },
            };
        }

        const documentNumber = (query.doc as string) || '';
        const clientId = (query.clientId as string) || '';
        const taskId = (query.taskId as string) || '';

        const [translations, document] = await Promise.all([
            serverSideTranslations(locale, [TranslationFiles.COMMON]),
            getDocumentSSR(documentNumber, DocumentType.Reg60, clientId.toUpperCase(), accessToken),
        ]);

        if (!document?.caseId) {
            logError('create-case/nb_reg_60/id::Error getting document', {
                documentNumber,
                clientId,
                onbaseCaseId: document?.caseId,
                contractNum: document?.contract,
            });
            return {
                redirect: {
                    destination: `/create-case/error?errorCode=${ERROR_CODES.DOCUMENT_RETRIEVAL}`,
                    permanent: false,
                },
            };
        }

        logInfo('create-case/nb_reg_60/id::Success getting document', {
            documentNumber,
            clientId,
            onbaseCaseId: document?.caseId,
            contractNum: document?.contract,
        });

        if (taskId) {
            form = await getCaseTaskByIdSSR(taskId, accessToken);
        } else {
            form = {
                data: {
                    userId: user?.email,
                    clientId: clientId?.toUpperCase(),
                },
            };
        }

        return {
            props: {
                ...translations,
                document,
                form,
                locale,
                transactionsHistory: null,
                user,
            },
        };
    },
});
