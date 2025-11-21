import { getAccessToken } from '@auth0/nextjs-auth0';
import dynamic from 'next/dynamic';
import router from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useMemo, useState } from 'react';

import { generateCommunicationRequest } from '@deps/components/otp-send-document/correspondence.helpers';
import { DefaultFormDetail } from '@deps/components/otp-send-document/form-selection';
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
import {
    CommunicationTypes,
    SearchTransactionRequestBody,
    SearchTransactionResponseBody,
    SendDocumentFormParts,
    SendDocumentFormType,
} from '@deps/models/case/send-document';
import { UserProfile } from '@deps/models/user-profile';
import Custom404Page from '@deps/pages/404s';
import {
    getSearchTransactions,
    sendCommunication,
} from '@deps/queries/api/c2web';
import { fetchPolicy } from '@deps/queries/api/policies';
import { baseAppUrl } from '@deps/queries/api-config';
import {
    SegmentPageName,
    SegmentTrackedPageProps,
} from '@deps/types/segment-analytics';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
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
    LoggingContext,
} from '@deps/utils/server-logging';
import { Policy } from '@zinnia/api-types/types/sor';
import nextI18nextConfig from 'next-i18next.config';

const FormSelection = dynamic(
    () => import('@deps/components/otp-send-document/form-selection')
);
const Correspondence = dynamic(
    () => import('@deps/components/otp-send-document/correspondence')
);
const ConfirmComponent = dynamic(
    () => import('@deps/components/otp-send-document/confirm')
);

interface SendDocumentProps extends SegmentTrackedPageProps {
    featureFlagDecisions: FeatureFlags;
    user: UserProfile;
}

const SendDocument = ({ featureFlagDecisions, user }: SendDocumentProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'sendDocument' });

    const { ctiCallNumber, correlationId, policyNumber, planCode } =
        router.query;

    const [formDetails, setFormDetails] = useState<SendDocumentFormParts[]>([
        DefaultFormDetail,
    ]);

    useSegmentPageTracker(user, SegmentPageName.SendDocument, {
        ctiCallNumber,
        correlationId,
        policyNumber: policyNumber,
    });

    const formSelectionLabel = t('tabs.formSelection');
    const CorrespondenceLabel = t('tabs.correspondence');
    const confirmLabel = t('tabs.confirm');

    const shouldShowCaseButton =
        featureFlagDecisions?.[FEATURE_FLAGS.SEND_DOCUMENT_SHOW_CASE_BUTTON] ??
        false;

    const [policy, setPolicy] = useState<Policy>();
    const [notFound, setNotFound] = useState<boolean>(false);
    const [availableFormsTransactions, setAvailableFormsTransactions] =
        useState<SearchTransactionResponseBody>([]);
    const [areFormsLoading, setAreFormsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!policyNumber || !planCode || !correlationId) return;
            setAreFormsLoading(true);

            try {
                const fetchedPolicy = await fetchPolicy(
                    policyNumber as string,
                    planCode as string
                );
                if (!fetchedPolicy) {
                    browserLogError(
                        `[Policy Fetch Error] No policy found for planCode: ${planCode}, policyNumber: ${policyNumber}`
                    );
                    setNotFound(true);
                    return;
                }
                setPolicy(fetchedPolicy);

                const transactionRequestBody: SearchTransactionRequestBody = {
                    carrier: fetchedPolicy?.carrierId || '',
                    issueState: fetchedPolicy?.issueState || '',
                    planCode: fetchedPolicy?.product?.planCode || '',
                };

                browserLogInfo('getSearchTransactions::Fetched transactions', {
                    payload: transactionRequestBody,
                    url: `${baseAppUrl}/referencedata/transactions/search`,
                    function: 'c2web.getSearchTransactions',
                });

                const transactions = await getSearchTransactions(
                    transactionRequestBody
                );
                setAvailableFormsTransactions(transactions ?? []);
            } catch (error: any) {
                browserLogError(
                    'getSearchTransactions:: Failed to fetch transactions',
                    {
                        ...parseErrorInformation(error),
                    } as LoggingContext
                );
            } finally {
                setAreFormsLoading(false);
            }
        };

        fetchData();
    }, [policyNumber, planCode, correlationId]);

    const hideMailOptionForSpecifiedCarrier =
        `SEND_DOCUMENT_HIDE_MAIL_OPTION_${policy?.carrierId}` as keyof typeof FEATURE_FLAGS;
    const shouldShowMailOption =
        (featureFlagDecisions?.[FEATURE_FLAGS.SEND_DOCUMENT_SHOW_MAIL_OPTION] ??
            false) &&
        !(
            featureFlagDecisions?.[
                FEATURE_FLAGS[hideMailOptionForSpecifiedCarrier]
            ] ?? false
        );

    const communicationTypes = useMemo(
        () => [
            {
                label: t('correspondence.email'),
                value: CommunicationTypes.Email,
            },
            {
                label: t('correspondence.fax'),
                value: CommunicationTypes.Fax,
            },
        ],
        [t]
    );
    const [communicationOptions, setCommunicationOptions] =
        useState(communicationTypes);

    useEffect(() => {
        const mailOption = {
            label: t('correspondence.mail'),
            value: CommunicationTypes.Mail,
        };
        if (shouldShowMailOption) {
            setCommunicationOptions([...communicationTypes, mailOption]);
        }
    }, [communicationTypes, shouldShowMailOption, t]);

    const handleSubmitRequest = async (state: CorrespondenceFormParts) => {
        const attachments: AttachmentDetails[] = formDetails.map(
            (formDetail) => {
                return {
                    transactionType:
                        formDetail?.transactionType?.list?.find(
                            (item) =>
                                item.value ===
                                formDetail?.transactionType?.selected
                        )?.label || '',
                    transactionSubType:
                        formDetail?.transactionSubType?.list?.find(
                            (item) =>
                                item.value ===
                                formDetail?.transactionSubType?.selected
                        )?.label || '',
                    attachmentType: AttachmentType.Form,
                    displayName:
                        formDetail?.document.selected?.formShortName ?? '',
                    formId:
                        formDetail?.document.selected?.formId.toString() ?? '',
                    formName:
                        formDetail?.document.selected?.formShortName ?? '',
                };
            }
        );

        const requestBody = generateCommunicationRequest(
            policy ?? {},
            state?.correspondence?.type as CommunicationTypes,
            state,
            user,
            ctiCallNumber as string,
            correlationId as string,
            SendDocumentFormType.ServiceRequestForm,
            attachments
        );

        try {
            return await sendCommunication(requestBody);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error('An unknown error occurred');
            }
        }
    };

    const steps: Step[] = useMemo(
        () => [
            {
                component: (
                    <FormSelection
                        policy={policy ?? {}}
                        ctiCallNumber={ctiCallNumber as string}
                        formDetails={formDetails}
                        setFormDetails={setFormDetails}
                        availableFormsTransactions={
                            availableFormsTransactions ?? []
                        }
                        isLoading={areFormsLoading}
                    />
                ),
                screenReaderLabel: formSelectionLabel,
                index: 0,
                text: formSelectionLabel,
            },
            {
                component: (
                    <Correspondence
                        communicationOptions={communicationOptions}
                        policy={policy ?? {}}
                        submitRequest={handleSubmitRequest}
                    />
                ),
                screenReaderLabel: CorrespondenceLabel,
                index: 1,
                text: CorrespondenceLabel,
            },
            {
                component: (
                    <ConfirmComponent
                        shouldShowCaseButton={shouldShowCaseButton}
                        formNames={formDetails.map(
                            (formDetail) =>
                                formDetail.document.selected?.formShortName ||
                                ''
                        )}
                    />
                ),
                screenReaderLabel: confirmLabel,
                index: 2,
                text: confirmLabel,
            },
        ],
        [
            policy,
            formSelectionLabel,
            confirmLabel,
            CorrespondenceLabel,
            communicationOptions,
            formDetails,
            availableFormsTransactions,
        ]
    );

    if (notFound) {
        return <Custom404Page />;
    }

    return (
        <>
            <PageHead titleKey="sendDocument" />
            <CorrespondenceProvider>
                <TabGroupContainer
                    steps={steps}
                    policy={new PolicyDetails(policy)}
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

            let accessToken;
            try {
                accessToken = (await getAccessToken(req, res)).accessToken;
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
        file: 'contact-center/send-document/index',
        function: 'getServerSideProps',
        page: 'contact-center/send-document',
    }
);

export default SendDocument;
