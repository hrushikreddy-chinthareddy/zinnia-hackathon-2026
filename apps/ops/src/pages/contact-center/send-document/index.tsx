import { getAccessToken, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { GetServerSidePropsContext } from 'next';
import router from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useMemo, useState } from 'react';

import NoNavLayout from '@deps/components/no-nav-layout';
import ConfirmComponent from '@deps/components/otp-send-document/confirm';
import Correspondence from '@deps/components/otp-send-document/correspondence';
import { generateCommunicationRequest } from '@deps/components/otp-send-document/correspondence.helper';
import FormSelection from '@deps/components/otp-send-document/form-selection';
import { TranslationFiles } from '@deps/config/translations';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import TabGroupContainer from '@deps/containers/tab-group-container/tab-group';
import { CorrespondenceProvider } from '@deps/contexts/CorrespondenceContext';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { AttachmentDetails, CorrespondenceFormParts } from '@deps/models/case/correspondence';
import { CommunicationTypes, SendDocumentFormParts, SendDocumentFormType, TransactionType } from '@deps/models/case/send-document';
import { Policy } from '@deps/models/policy/sor-policy';
import { UserPermission, UserProfile } from '@deps/models/user-profile';
import { getTransactionTypesSSR, sendCommunication } from '@deps/queries/api/c2web';
import { getPolicyDetailsSsr } from '@deps/queries/api/policies';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { logWarn, logError, getUserInfoFromUser, parseErrorInformation } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

type SendDocumentProps = {
    policy: Policy;
    transactionTypes: TransactionType[];
    shouldShowCaseButton: FeatureFlags;
    shouldShowMailOption: FeatureFlags;
    user: UserProfile;
};

const SendDocument = ({ policy, transactionTypes, shouldShowCaseButton, shouldShowMailOption, user }: SendDocumentProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'sendDocument' });
    const transactionOptions = transactionTypes?.map(transaction => {
        return { label: transaction.name, value: transaction.id };
    });

    const [formDetails, setFormDetails] = useState<SendDocumentFormParts>({} as SendDocumentFormParts);
    const { ctiCallNumber, correlationId } = router.query;
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
        const attachments: AttachmentDetails[] = [
            {
                transactionType:
                    formDetails?.transactionType?.list?.find(item => item.value === formDetails?.transactionType?.selected)?.label || '',
                transactionSubType:
                    formDetails?.transactionSubType?.list?.find(item => item.value === formDetails?.transactionSubType?.selected)?.label ||
                    '',
                attachmentType: 'form',
                displayName: formDetails?.document.selected?.formDisplayName ?? '',
                formId: formDetails?.document.selected?.formId.toString() ?? '',
                formName: formDetails?.document.selected?.formDisplayName ?? '',
            },
        ];

        const requestBody = generateCommunicationRequest(
            policy,
            state?.correspondence?.type,
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
                    transactionTypes={transactionOptions}
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
                    formNames={[formDetails?.document?.selected?.formDisplayName || '']}
                />
            ),
            screenReaderLabel: confirmLabel,
            index: 2,
            text: confirmLabel,
        },
    ];

    return (
        <NoNavLayout fullHeight={true}>
            <CorrespondenceProvider>
                <TabGroupContainer steps={steps} policy={new PolicyDetails(policy)}></TabGroupContainer>
            </CorrespondenceProvider>
        </NoNavLayout>
    );
};

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: async (context: GetServerSidePropsContext) => {
        const user = await getUserData(context);
        const { locale = DEFAULT_LOCALE, query, req, res } = context;
        const planCode = (query.planCode as string) || '';
        const policyNumber = (query?.policyNumber as string) || '';

        let accessToken;
        try {
            accessToken = (await getAccessToken(req, res)).accessToken;
        } catch (e) {
            logWarn('getServerSidePropsPolicyDetailsPage::Access token expired', {
                ...parseErrorInformation(e),
                file: 'utils/page',
                function: 'getServerSidePropsPolicyDetailsPage',
            });
            return serverSidePropsLogout();
        }
        // Create a permissions object to pass to the page, strongly typed using the enum.
        const doesUserHasPagePermissions = await doesUserHavePagePermissions(accessToken, user, UserPermission.AllowReadOtpRenewals);
        const featureFlagDecisions: FeatureFlags = await optimizelyService.getFeatureFlagDecisions(user.sub);
        const shouldShowSendDocumentPage = featureFlagDecisions?.[FEATURE_FLAGS.SEND_DOCUMENT];
        const shouldShowCaseButton = featureFlagDecisions?.[FEATURE_FLAGS.SEND_DOCUMENT_SHOW_CASE_BUTTON];

        if (!doesUserHasPagePermissions || !shouldShowSendDocumentPage) {
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
            const userInfoForLogging = getUserInfoFromUser(user);
            const policy = await getPolicyDetailsSsr(policyNumber, planCode, accessToken, userInfoForLogging);
            if (!policy) {
                return {
                    redirect: {
                        destination: '/404',
                        permanent: false,
                    },
                };
            }
            const transactionTypes = await getTransactionTypesSSR(accessToken, userInfoForLogging);
            const hideMailOptionForSpecifiedCarrier = `SEND_DOCUMENT_HIDE_MAIL_OPTION_${policy.carrierId}` as keyof typeof FEATURE_FLAGS;

            const shouldShowMailOption =
                featureFlagDecisions?.[FEATURE_FLAGS.SEND_DOCUMENT_SHOW_MAIL_OPTION] &&
                !featureFlagDecisions?.[FEATURE_FLAGS[hideMailOptionForSpecifiedCarrier]];

            return {
                props: {
                    ...translations,
                    policy,
                    transactionTypes: transactionTypes || [],
                    shouldShowCaseButton: shouldShowCaseButton ?? false,
                    shouldShowMailOption: shouldShowMailOption ?? false,
                    user,
                },
            };
        } catch (error) {
            logError('getServerSidePropsPolicyDetailsPage', { ...parseErrorInformation(error) });
            return {
                props: {},
            };
        }
    },
});

export default SendDocument;
