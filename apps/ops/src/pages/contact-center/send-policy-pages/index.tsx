import { getAccessToken } from '@auth0/nextjs-auth0';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import router from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMemo } from 'react';

import { generateCommunicationRequest } from '@deps/components/otp-send-document/correspondence.helpers';
import { PageHead } from '@deps/components/page-title';
import { TranslationFiles } from '@deps/config/translations';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import TabGroupContainer from '@deps/containers/tab-group-container/tab-group';
import { CorrespondenceProvider } from '@deps/contexts/CorrespondenceContext';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { getUserData } from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import {
    AttachmentDetails,
    AttachmentType,
    CorrespondenceFormParts,
} from '@deps/models/case/correspondence';
import { DocumentType } from '@deps/models/case/document';
import {
    CommunicationTypes,
    SendDocumentFormType,
} from '@deps/models/case/send-document';
import { UserProfile } from '@deps/models/user-profile';
import Custom404Page from '@deps/pages/404s';
import { sendCommunication } from '@deps/queries/api/c2web';
import { searchDocumentsV3 } from '@deps/queries/api/client/documents/v3/search';
import { fetchPolicy } from '@deps/queries/api/policies';
import {
    SegmentPageName,
    SegmentTrackedPageProps,
} from '@deps/types/segment-analytics';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    FeatureFlags,
    optimizelyService,
} from '@deps/utils/optimizely/optimizely';
import {
    logWarn,
    logError,
    parseErrorInformation,
    withPageAuthAndLogging,
} from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

const Correspondence = dynamic(
    () => import('@deps/components/otp-send-document/correspondence')
);
const ConfirmComponent = dynamic(
    () => import('@deps/components/otp-send-document/confirm')
);

interface SendPolicyPagesProps extends SegmentTrackedPageProps {
    featureFlagDecisions: FeatureFlags;
    user: UserProfile;
}

const SendPolicyPages = ({
    featureFlagDecisions,
    user,
}: SendPolicyPagesProps) => {
    const { t } = useTranslation();
    const { ctiCallNumber, correlationId, policyNumber, planCode } =
        router.query;
    const CorrespondenceLabel = t('allFields.correspondence');
    const confirmLabel = t('allFields.confirm');
    const shouldShowCaseButton =
        featureFlagDecisions?.[FEATURE_FLAGS.SEND_DOCUMENT_SHOW_CASE_BUTTON] ??
        false;

    useSegmentPageTracker(user, SegmentPageName.SendDocument, {
        ctiCallNumber,
        correlationId,
        policyNumber,
    });

    const { data: policy, isSuccess } = useQuery({
        queryKey: ['policy', policyNumber, planCode],
        queryFn: () => {
            if (
                typeof policyNumber === 'string' &&
                typeof planCode === 'string'
            ) {
                return fetchPolicy(policyNumber, planCode);
            }
            return null;
        },
        enabled: !!policyNumber && !!planCode,
    });

    const { data: policyPage } = useQuery({
        queryKey: [
            'policyPage',
            policy?.product?.planCode,
            policy?.policyNumber,
        ],
        queryFn: () =>
            searchDocumentsV3({
                searchBody: {
                    documentType: DocumentType.PolicyPage,
                    planCode: policy?.product?.planCode || '',
                    policyNumber: policy?.policyNumber || '',
                },
            }),
        enabled: !!policy,
    });

    const shouldShowMailOption =
        featureFlagDecisions?.[FEATURE_FLAGS.SEND_DOCUMENT_SHOW_MAIL_OPTION] &&
        !(
            policy?.carrierId === 'ILNA' &&
            featureFlagDecisions?.[
                FEATURE_FLAGS.SEND_DOCUMENT_HIDE_MAIL_OPTION_ILNA
            ]
        );

    const communicationTypes = useMemo(
        () => [
            {
                label: t('allFields.email'),
                value: CommunicationTypes.Email,
            },
            {
                label: t('allFields.fax'),
                value: CommunicationTypes.Fax,
            },
        ],
        [t]
    );

    const communicationOptions = useMemo(() => {
        const mailOption = {
            label: t('allFields.mail'),
            value: CommunicationTypes.Mail,
        };
        if (shouldShowMailOption) {
            return [...communicationTypes, mailOption];
        }
        return communicationTypes;
    }, [communicationTypes, shouldShowMailOption, t]);

    const handleSubmitRequest = async (state: CorrespondenceFormParts) => {
        const attachments: AttachmentDetails[] =
            policyPage?.data?.documents?.map((document) => {
                return {
                    transactionType: '',
                    transactionSubType: '',
                    attachmentType: AttachmentType.PolicyPages,
                    displayName: document.displayName ?? '',
                    formId: document.documentId ?? '',
                    formName: document.displayName ?? '',
                };
            }) || [];

        const requestBody = generateCommunicationRequest(
            policy ?? {},
            state?.correspondence?.type as CommunicationTypes,
            state,
            user,
            ctiCallNumber as string,
            correlationId as string,
            SendDocumentFormType.PolicyPagesForm,
            attachments
        );

        try {
            return sendCommunication(requestBody);
        } catch (error) {
            if (error instanceof Error) {
                throw Error(error.message);
            } else {
                throw Error('An unknown error occurred.', { cause: error });
            }
        }
    };

    const steps: Step[] = [
        {
            component: (
                <Correspondence
                    communicationOptions={communicationOptions}
                    policy={policy ?? {}}
                    submitRequest={handleSubmitRequest}
                />
            ),
            screenReaderLabel: CorrespondenceLabel,
            index: 0,
            text: CorrespondenceLabel,
        },
        {
            component: (
                <ConfirmComponent
                    shouldShowCaseButton={shouldShowCaseButton}
                    formNames={
                        policyPage?.data?.documents?.map(
                            (document) => document.displayName ?? ''
                        ) ?? ['']
                    }
                />
            ),
            screenReaderLabel: confirmLabel,
            index: 1,
            text: confirmLabel,
        },
    ];

    if (isSuccess && !policy) {
        return <Custom404Page />;
    }

    return (
        <>
            <PageHead titleKey="sendPolicyPages" />
            <CorrespondenceProvider>
                <TabGroupContainer
                    steps={steps}
                    policy={new PolicyDetails(policy ?? {})}
                    showLoader={true}
                ></TabGroupContainer>
            </CorrespondenceProvider>
        </>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            const user = await getUserData(context);
            const { locale = DEFAULT_LOCALE, req, res } = context;

            try {
                await getAccessToken(req, res);
            } catch (e) {
                logWarn(
                    'getServerSidePropsPolicyDetailsPage::Access token expired',
                    {
                        ...parseErrorInformation(e),
                        ...loggingContext,
                    }
                );
                return serverSidePropsLogout();
            }

            // Create a permissions object to pass to the page, strongly typed using the enum.
            const featureFlagDecisions: FeatureFlags =
                await optimizelyService.getFeatureFlagDecisions(
                    user.sub,
                    loggingContext
                );
            const shouldShowSendDocumentPage =
                featureFlagDecisions?.[FEATURE_FLAGS.SEND_DOCUMENT];

            if (!shouldShowSendDocumentPage) {
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
            try {
                return {
                    props: {
                        ...translations,
                        featureFlagDecisions,
                        user,
                    },
                };
            } catch (error) {
                logError('getServerSidePropsPolicyDetailsPage', {
                    ...parseErrorInformation(error),
                    ...loggingContext,
                });
                return {
                    props: {},
                };
            }
        },
    },
    {
        file: 'contact-center/send-policy-pages/index',
        function: 'getServerSideProps',
        page: 'contact-center/send-policy-pages',
    }
);

export default SendPolicyPages;
