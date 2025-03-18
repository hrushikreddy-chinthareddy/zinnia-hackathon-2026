import { getAccessToken } from '@auth0/nextjs-auth0';
import { setCookie } from 'cookies-next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { ReactNode, useEffect, useState } from 'react';

import CardInfo from '@deps/components/card/card-info/card-info';
import NoNavLayout from '@deps/components/no-nav-layout';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { CaseTypeToProcessesMap } from '@deps/constants/case';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { getSlug } from '@deps/helpers/string.helper';
import { CaseType, Statuses } from '@deps/models/case/case';
import { DocumentType } from '@deps/models/case/document';
import { caseTypes } from '@deps/models/case/helpers';
import { UserPermission } from '@deps/models/user-profile';
import { getCases } from '@deps/queries/api/cases';
import { getDocumentV2 } from '@deps/queries/api/documents';
import { ReactComponent as ErrorIcon } from '@deps/styles/elements/icons/icons_outlined/exclamation-alert.svg';
import { ReactComponent as SuccessIcon } from '@deps/styles/elements/icons/icons_outlined/refresh-2.svg';
import loadingImage from '@deps/styles/images/loader.png';
import { browserLogInfo, browserLogWarn } from '@deps/utils/browser-logging';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { logWarn, parseErrorInformation, withPageAuthAndLogging } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

const OTP_FORM_CLIENT_COOKIE = 'otp-form-client-cookie';
const OTP_FORM_TYPE_COOKIE = 'otp-form-type-cookie';

const getCaseType = (docTypeQuery: string): CaseType | undefined => {
    const loweredKeyedObj = Object.keys(caseTypes).reduce((acc, docTypeKey) => {
        acc[docTypeKey.toLowerCase()] = caseTypes[docTypeKey as DocumentType];
        return acc;
    }, {} as { [key: string]: CaseType });

    return loweredKeyedObj[docTypeQuery?.toLowerCase()];
};

interface CaseCreateProps {
    featureFlagDecisions: FeatureFlags;
}

export default function CaseCreate({ featureFlagDecisions }: CaseCreateProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'createCaseCreate' });
    const router = useRouter();
    const [cardProps, setCardProps] = useState({ title: '', subtitle: '', icon: null as ReactNode });
    const [isError, setIsError] = useState(false);

    const { clientCode, docType, documentNumber } = router.query;
    const caseType = docType ? getCaseType(docType as string) : null;

    const handleRouteComplete = () => {
        router.events.off('routeChangeComplete', handleRouteComplete);
    };

    if (!isError && (!clientCode || !docType || !documentNumber)) {
        setIsError(true);
        setCardProps({
            icon: <ErrorIcon className="text-semantic-warning" width={50} height={50} />,
            title: t('errors.errorCreatingCase') as string,
            subtitle: t('errors.missingValues', {
                clientCode: `${clientCode}`,
                docType: `${docType}`,
                documentNumber: `${documentNumber}`,
            }) as string,
        });
    } else if (!isError && !caseType) {
        setIsError(true);
        setCardProps({
            title: t('errors.errorCreatingCase') as string,
            subtitle: t('errors.unsupportedDocType') as string,
            icon: <ErrorIcon className="text-semantic-warning" width={50} height={50} />,
        });
    }

    useEffect(() => {
        router.events.on('routeChangeComplete', handleRouteComplete);
        if (!isError) {
            setCardProps({
                title: t('momentPlease') as string,
                subtitle: t('creatingCase', { clientCode, documentNumber }) as string,
                icon: <Image src={loadingImage} alt={t('momentPlease') as string} className="text-semantic-info" height={50} width={50} />,
            });
            initializeCaseCreation();
        }
    }, []);

    const initializeCaseCreation = async () => {
        if (!caseType || !docType || !clientCode || !documentNumber) {
            browserLogWarn('onBaseCreateTask::Missing case type, docType, clientCode, or documentNumber.', {
                caseType,
                docType,
                clientCode,
                documentNumber,
            });
            return;
        }
        setCookie(OTP_FORM_CLIENT_COOKIE, clientCode, { maxAge: 1000 * 60 * 60 * 12 }); // 12hrs
        setCookie(OTP_FORM_TYPE_COOKIE, caseType, { maxAge: 1000 * 60 * 60 * 12 });
        try {
            const document = await getDocumentV2(documentNumber as string, docType as string, clientCode as string);
            if (!document?.documentNumber) {
                throw new Error('Document data was not returned from the documents service.');
            }

            const response = await getCases({
                limit: 25,
                policyNumber: document?.contract,
                notInCaseStatus: [Statuses.Completed],
                process: [CaseTypeToProcessesMap[caseType]],
                sortDirection: 'desc',
                sortBy: 'createdAt',
            });

            if (response && 'total' in response) {
                if (response.data.length > 0) {
                    const caseId = response.data?.[0].id;

                    if (!caseId) {
                        throw new Error('The case creation request to the case management service did not succeed.');
                    }
                    browserLogInfo('onBaseCreateTask::Cases are not-completed. Redirecting to existing case.', {
                        caseId,
                        caseType,
                        docType,
                        clientCode,
                        documentNumber,
                    });

                    setCardProps({
                        title: t('success') as string,
                        subtitle: t('successMessage') as string,
                        icon: <SuccessIcon className="-scale-x-100 scale-y-100 text-semantic-success" width={50} height={50} />,
                    });

                    const shouldShowNewExperience = featureFlagDecisions?.[FEATURE_FLAGS.NEW_EXP];
                    const getLastSaved = shouldShowNewExperience ? `&getLastSaved=true` : '';
                    const caseSlug = getSlug(caseType);
                    browserLogInfo('onBaseCreateTask::Redirecting to a task', {
                        caseId,
                        caseType,
                        docType,
                        clientCode,
                        documentNumber,
                    });
                    router.push(
                        `/create-case/${caseSlug}/${caseId}?doc=${document.documentNumber}&clientId=${clientCode as string}${getLastSaved}`
                    );
                    return;
                } else {
                    browserLogInfo('onBaseCreateTask::Cases are completed. Re-directing to create case page', {
                        caseType,
                        docType,
                        clientCode,
                        documentNumber,
                    });
                    router.push(`/create-case/`);
                    return;
                }
            } else {
                throw new Error('Unable to retrieve cases search results.');
            }
        } catch (e) {
            browserLogWarn('onBaseCreateTask::Task initialization failure', {
                ...parseErrorInformation(e),
                caseType,
                docType,
                clientCode,
                documentNumber,
            });
            setIsError(true);
            setCardProps({
                title: t('errors.errorCreatingCase') as string,
                subtitle: (e as unknown as Error)?.message || 'unknown',
                icon: <ErrorIcon className="text-semantic-warning" width={50} height={50} />,
            });
        }
    };

    return (
        <NoNavLayout fullHeight={true}>
            <div className="flex flex-col">
                <div className="mb-4 w-[600px] self-center rounded bg-white p-4 shadow-sm">
                    <div className="mb-4 flex flex-col border-b p-4">
                        <Typography variant={TypographyVariant.H1} className="self-center font-primary text-xl font-light">
                            {t('title')}
                        </Typography>
                    </div>
                    <CardInfo
                        icon={
                            <div className={!isError ? 'transform-origin-center duration-2000 animate-spin ease-linear' : ''}>
                                {cardProps.icon}
                            </div>
                        }
                        title={cardProps.title}
                        subtitle={cardProps.subtitle}
                        cta={
                            isError
                                ? {
                                      action: () => {
                                          router.replace('/create-case');
                                      },
                                      text: t('errors.backToCreateCase'),
                                  }
                                : undefined
                        }
                    />
                </div>
            </div>
        </NoNavLayout>
    );
}

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            const user = await getUserData(context);
            const featureFlagDecisions: FeatureFlags = await optimizelyService.getFeatureFlagDecisions(user.sub);
            const { locale = DEFAULT_LOCALE, res, req } = context;
            try {
                (await getAccessToken(req, res)).accessToken;
            } catch (e) {
                logWarn('create-case/create/index:: Access token expired', {
                    ...parseErrorInformation(e),
                    ...loggingContext,
                });
                return serverSidePropsLogout();
            }

            const doesUserHasPagePermissions = await doesUserHavePagePermissions(context, UserPermission.AllowReadOtpRenewals);
            if (!doesUserHasPagePermissions) {
                return {
                    redirect: {
                        destination: '/403',
                        permanent: false,
                    },
                };
            }

            const translations = await serverSideTranslations(locale, [TranslationFiles.COMMON], nextI18nextConfig, ALL_LOCALES);
            return { props: { locale, ...translations, featureFlagDecisions } };
        },
    },
    { file: 'create-case/create/index', function: 'getServerSideProps', page: 'create-case/create' }
);
