import { getAccessToken } from '@auth0/nextjs-auth0';
import router from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useMemo, useState } from 'react';

import ConfirmComponent from '@deps/components/otp-send-document/confirm';
import Correspondence from '@deps/components/otp-send-document/correspondence';
import { generateCommunicationRequest } from '@deps/components/otp-send-document/correspondence.helper';
import FormSelection, { DefaultFormDetail } from '@deps/components/otp-send-document/form-selection';
import { TranslationFiles } from '@deps/config/translations';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import TabGroupContainer from '@deps/containers/tab-group-container/tab-group';
import { CorrespondenceProvider } from '@deps/contexts/CorrespondenceContext';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { getUserData } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { AttachmentDetails, AttachmentType, CorrespondenceFormParts } from '@deps/models/case/correspondence';
import {
    AvailableFormsTransaction,
    CommunicationTypes,
    SearchTransactionRequestBody,
    SendDocumentFormParts,
    SendDocumentFormType,
} from '@deps/models/case/send-document';
import { Policy } from '@deps/models/policy/sor-policy';
import { UserProfile } from '@deps/models/user-profile';
import { getSearchTransactionsSSR, sendCommunication } from '@deps/queries/api/c2web';
import { getPolicyDetailsSsr } from '@deps/queries/api/policies';
import { SegmentPageName, SegmentTrackedPageProps } from '@deps/types/segment-analytics';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { logWarn, logError, parseErrorInformation, logInfo, withPageAuthAndLogging } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

interface SendDocumentProps extends SegmentTrackedPageProps {
    policy: Policy;
    availableFormsTransactions: AvailableFormsTransaction[];
    shouldShowCaseButton: FeatureFlags;
    shouldShowMailOption: FeatureFlags;
    user: UserProfile;
}

const SendDocument = ({ policy, availableFormsTransactions, shouldShowCaseButton, shouldShowMailOption, user }: SendDocumentProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'sendDocument' });

    const [formDetails, setFormDetails] = useState<SendDocumentFormParts[]>([DefaultFormDetail]);
    const { ctiCallNumber, correlationId } = router.query;

    useSegmentPageTracker(user, SegmentPageName.SendDocument, { ctiCallNumber, correlationId, policyNumber: policy.policyNumber });

    const formSelectionLabel = t('tabs.formSelection');
    const CorrespondenceLabel = t('tabs.correspondence');
    const confirmLabel = t('tabs.confirm');

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
    const [communicationOptions, setCommunicationOptions] = useState(communicationTypes);

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
        const attachments: AttachmentDetails[] = formDetails.map(formDetail => {
            return {
                transactionType:
                    formDetail?.transactionType?.list?.find(item => item.value === formDetail?.transactionType?.selected)?.label || '',
                transactionSubType:
                    formDetail?.transactionSubType?.list?.find(item => item.value === formDetail?.transactionSubType?.selected)?.label ||
                    '',
                attachmentType: AttachmentType.Form,
                displayName: formDetail?.document.selected?.formShortName ?? '',
                formId: formDetail?.document.selected?.formId.toString() ?? '',
                formName: formDetail?.document.selected?.formShortName ?? '',
            };
        });

        const requestBody = generateCommunicationRequest(
            policy,
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

    const steps: Step[] = [
        {
            ariaLabel: formSelectionLabel,
            component: (
                <FormSelection
                    policy={policy}
                    ctiCallNumber={ctiCallNumber as string}
                    formDetails={formDetails}
                    setFormDetails={setFormDetails}
                    availableFormsTransactions={availableFormsTransactions}
                />
            ),
            screenReaderLabel: formSelectionLabel,
            index: 0,
            text: formSelectionLabel,
        },
        {
            ariaLabel: CorrespondenceLabel,
            component: <Correspondence communicationOptions={communicationOptions} policy={policy} submitRequest={handleSubmitRequest} />,
            screenReaderLabel: CorrespondenceLabel,
            index: 1,
            text: CorrespondenceLabel,
        },
        {
            ariaLabel: confirmLabel,
            component: (
                <ConfirmComponent
                    shouldShowCaseButton={shouldShowCaseButton}
                    formNames={formDetails.map(formDetail => formDetail.document.selected?.formShortName || '')}
                />
            ),
            screenReaderLabel: confirmLabel,
            index: 2,
            text: confirmLabel,
        },
    ];

    return (
        <CorrespondenceProvider>
            <TabGroupContainer steps={steps} policy={new PolicyDetails(policy)}></TabGroupContainer>
        </CorrespondenceProvider>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            const user = await getUserData(context);
            const { locale = DEFAULT_LOCALE, query, req, res } = context;
            const planCode = (query.planCode as string) || '';
            const policyNumber = (query?.policyNumber as string) || '';
            const correlationId = (query?.correlationId as string) || '';

            let accessToken;
            try {
                accessToken = (await getAccessToken(req, res)).accessToken;
            } catch (e) {
                logWarn('getServerSidePropsPolicyDetailsPage::Access token expired', {
                    ...parseErrorInformation(e),
                    ...loggingContext,
                });
                return serverSidePropsLogout();
            }
            // Create a permissions object to pass to the page, strongly typed using the enum.
            const featureFlagDecisions: FeatureFlags = await optimizelyService.getFeatureFlagDecisions(user.sub, loggingContext);
            const shouldShowSendDocumentPage = featureFlagDecisions?.[FEATURE_FLAGS.SEND_DOCUMENT];
            const shouldShowCaseButton = featureFlagDecisions?.[FEATURE_FLAGS.SEND_DOCUMENT_SHOW_CASE_BUTTON];

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
                const policy = await getPolicyDetailsSsr(policyNumber, planCode, accessToken, loggingContext, true);
                if (!policy) {
                    logInfo('contact-center/send-document/policy-not-found', loggingContext);
                    return {
                        redirect: {
                            destination: `/404?title=policyNotFound&planCode=${planCode}&policyNumber=${policyNumber}`,
                            permanent: false,
                        },
                    };
                }
                const transactionRequestBody: SearchTransactionRequestBody = {
                    carrier: policy.carrierId || '',
                    issueState: policy.issueState || '',
                    planCode: policy.product?.planCode || '',
                };

                const transactionTypeSubTypes = await getSearchTransactionsSSR(transactionRequestBody, accessToken, {
                    ...loggingContext,
                    correlationId,
                });
                const hideMailOptionForSpecifiedCarrier =
                    `SEND_DOCUMENT_HIDE_MAIL_OPTION_${policy.carrierId}` as keyof typeof FEATURE_FLAGS;

                const shouldShowMailOption =
                    featureFlagDecisions?.[FEATURE_FLAGS.SEND_DOCUMENT_SHOW_MAIL_OPTION] &&
                    !featureFlagDecisions?.[FEATURE_FLAGS[hideMailOptionForSpecifiedCarrier]];

                return {
                    props: {
                        ...translations,
                        policy,
                        availableFormsTransactions: transactionTypeSubTypes || [],
                        shouldShowCaseButton: shouldShowCaseButton ?? false,
                        shouldShowMailOption: shouldShowMailOption ?? false,
                        user,
                    },
                };
            } catch (error) {
                logError('getServerSidePropsPolicyDetailsPage', { ...parseErrorInformation(error), ...loggingContext });
                return {
                    props: {},
                };
            }
        },
    },
    { file: 'contact-center/send-document/index', function: 'getServerSideProps', page: 'contact-center/send-document' }
);

export default SendDocument;
