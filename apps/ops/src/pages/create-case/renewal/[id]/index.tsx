import { getAccessToken, withPageAuthRequired } from '@auth0/nextjs-auth0';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localData from 'dayjs/plugin/localeData';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useState } from 'react';

import OtpLayout from '@deps/components/otp-layout';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import RenewalFormActions from '@deps/containers/otp/renewal-forms/components/renewal-form-actions';
import RenewalFormProvider from '@deps/containers/otp/renewal-forms/components/renewal-form-provider';
import DlicRenewalForm from '@deps/containers/otp/renewal-forms/dlic-form';
import MassRenewalForm from '@deps/containers/otp/renewal-forms/mass-mutual-form';
import SbgcRenewalForm from '@deps/containers/otp/renewal-forms/sbgc-form';
import { DiaryNotesProvider } from '@deps/contexts/DiaryNotesContext';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { DocumentData } from '@deps/models/case/document';
import { LifeCadParty } from '@deps/models/case/lifecad-party';
import { Carrier } from '@deps/models/case/withdrawal/case';
import { UserPermission } from '@deps/models/user-profile';
import { getDocumentSSR } from '@deps/queries/api/documents';
import { checkNigoExistsSSR } from '@deps/queries/api/integration';
import { getPolicyAccountInfoSSR, getPolicyPartiesSSR } from '@deps/queries/api/policies';
import { isNonProductionEnvironment } from '@deps/utils/environment.helper';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { logError, logInfo, logWarn, parseErrorInformation } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

import { ERROR_CODES } from '../../error';

interface CreateCaseDetailsProps {
    caseId: string;
    caseDocument: DocumentData;
    parties: LifeCadParty[];
    productCode: string;
    userId: string;
    clientId: string;
    featureFlagDecisions: FeatureFlags;
    planCode: string;
}

dayjs.extend(customParseFormat);
dayjs.extend(localData);

const determineFormToRender = (clientId: string): React.ReactNode => {
    switch (clientId.toUpperCase()) {
        case Carrier.SBGC:
            return <SbgcRenewalForm />;
        case Carrier.MASS:
            return <MassRenewalForm />;
        case Carrier.DLIC:
            return <DlicRenewalForm />;
        default:
            console.error('determineFormToRender::unsupported clientId', clientId);
            return null;
    }
};

const RenewalCaseDetails = ({
    caseId,
    caseDocument,
    parties,
    clientId,
    userId,
    featureFlagDecisions,
    planCode,
}: CreateCaseDetailsProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!caseDocument) {
            router.push('/create-case');

            return;
        }
    }, []);

    const { clientIdOverride, action } = router.query;
    const clientForFormDetermination = isNonProductionEnvironment() ? clientIdOverride || clientId : clientId;

    const formParts = determineFormToRender(clientForFormDetermination as string);

    if (!formParts) {
        console.error('RenewalCase::No form parts', {
            documentNumber: caseDocument?.documentNumber,
            clientId,
            contract: caseDocument?.contract,
        });
        router.push(`/create-case/error?errorCode=${ERROR_CODES.RENEWAL_FORM_CREATION}`);
    }
    const caseDetailsData = {
        clientId: clientId,
        policyNum: caseDocument?.contract || '',
    };

    // TODO: Create store and access store data from store. Wrapping OtpLayout with DiaryNotesProvider is not correct approach
    return (
        <DiaryNotesProvider caseDetails={caseDetailsData}>
            <OtpLayout
                childContainerClasses={
                    'mx-4 mb-8 mt-16 md:mx-6 lg:mx-8 [@media(min-width:1194px)]:mx-auto [@media(min-width:1194px)]:max-w-[1130px]'
                }
                clientId={clientId}
                contractNumber={caseDocument?.contract}
            >
                <header>
                    <div className="flex flex-col">
                        <Typography variant={TypographyVariant.H1}>{t('caseRenewal.request.header')}</Typography>
                        <Typography variant={TypographyVariant.H2} className="text-base">
                            {t('caseRenewal.request.caseId', { caseId: caseId })}
                        </Typography>
                    </div>
                </header>
                {isLoading && (
                    <div className="fixed left-0 top-0 z-10 flex h-screen w-screen justify-center bg-gray-800 opacity-80">
                        <PageLoader variant={PageLoaderVariant.Center} />
                    </div>
                )}
                <article className="my-4 min-h-[390px] min-w-[275px] rounded bg-white !p-0 shadow-sm">
                    <form className="rounded bg-white p-4 text-gray-900 md:p-6 lg:p-8">
                        <RenewalFormProvider
                            parties={parties}
                            userId={userId}
                            caseDocument={caseDocument}
                            action={action as string}
                            featureFlagDecisions={featureFlagDecisions}
                            planCode={planCode}
                        >
                            {formParts}
                            <RenewalFormActions clientId={clientId} userId={userId} caseId={caseId} setIsLoading={setIsLoading} />
                        </RenewalFormProvider>
                    </form>
                </article>
            </OtpLayout>
        </DiaryNotesProvider>
    );
};

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: async (context: GetServerSidePropsContext) => {
        const user = await getUserData(context);
        const featureFlagDecisions: FeatureFlags = await optimizelyService.getFeatureFlagDecisions(user.sub);
        const { locale = DEFAULT_LOCALE, query, params, req, res } = context;
        let accessToken;
        try {
            accessToken = (await getAccessToken(req, res)).accessToken;
        } catch (e) {
            logWarn('create-case/renewal/:id::Access token expired', {
                ...parseErrorInformation(e),
                file: 'create-case/renewal/:id/index',
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

        const translations = await serverSideTranslations(
            locale,
            [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
            nextI18nextConfig,
            ALL_LOCALES
        );
        const id = (params?.id as string) || '';
        const documentNumber = (query.doc as string) || '';
        const clientId = (query.clientId as string) || '';
        const taskId = (query.taskId as string) || '';
        const action = (query.action as string) || '';

        const caseDocument = await getDocumentSSR(documentNumber, 'Exchange', clientId, accessToken as string);

        if (!caseDocument?.contract) {
            logError('create-case/exchange/:id::Error getting document', {
                documentNumber,
                clientId,
                id,
                file: 'create-case/exchange/:id/index',
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
        if (shouldShowNewExperience && action !== 'readonly') {
            logInfo('create-case/renewal/:id:Checking NIGO', { taskId, action, documentNumber, id, clientId });
            const isNigoCase = await checkNigoExistsSSR(clientId.toUpperCase(), caseDocument.caseId, accessToken);
            if (isNigoCase) {
                logInfo('create-case/renewal/:id::Nigo exists for case', {
                    documentNumber,
                    clientId,
                    caseId: caseDocument.caseId,
                    lob: caseDocument?.lob,
                });
                return {
                    redirect: {
                        destination: `/create-case/error?errorCode=${ERROR_CODES.NIGO_EXISTS}`,
                        permanent: false,
                    },
                };
            }
        } else {
            logInfo('create-case/renewal/:id:Skipping NIGO check', { taskId, action, documentNumber, id, clientId });
        }

        let planCode = '';
        if ([Carrier.DLIC, Carrier.SBGC, Carrier.MASS].includes(clientId.toUpperCase() as Carrier)) {
            if (!caseDocument?.contract || !caseDocument?.processCompanyCode) {
                return {
                    redirect: {
                        destination: `/create-case/error?errorCode=${ERROR_CODES.RENEWAL_FORM_PLAN_CODE}`,
                        permanent: false,
                    },
                };
            }

            const acctInfoResponse = await getPolicyAccountInfoSSR(caseDocument.contract, caseDocument.processCompanyCode, accessToken);
            if (!acctInfoResponse?.PlanCode) {
                logInfo('create-case/renewal/:id::Plan code not found', {
                    documentNumber,
                    clientId,
                    caseId: id,
                    lob: caseDocument?.lob,
                    planCode,
                });
                return {
                    redirect: {
                        destination: `/create-case/error?errorCode=${ERROR_CODES.RENEWAL_FORM_PLAN_CODE}`,
                        permanent: false,
                    },
                };
            } else {
                planCode = acctInfoResponse?.PlanCode;
                logInfo('create-case/renewal/:id::Plan code found', {
                    documentNumber,
                    clientId,
                    caseId: id,
                    lob: caseDocument?.lob,
                    planCode,
                });
            }
        }

        const parties = caseDocument?.contract ? await getPolicyPartiesSSR(caseDocument?.contract, clientId, accessToken as string) : [];

        return {
            props: {
                locale,
                ...translations,
                caseId: id,
                caseDocument: caseDocument?.contract ? caseDocument : null,
                parties: Array.isArray(parties) ? parties : [],
                userId: user.email,
                clientId: clientId.toUpperCase(),
                featureFlagDecisions,
                planCode,
            },
        };
    },
});

export default RenewalCaseDetails;
