import { getAccessToken, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { GetServerSidePropsContext } from 'next';
import router from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMemo, useState } from 'react';

import NoNavLayout from '@deps/components/no-nav-layout';
import Confirm from '@deps/components/otp-send-document/confirm';
import Correspondence from '@deps/components/otp-send-document/correspondence';
import { generateCommunicationRequest } from '@deps/components/otp-send-document/correspondence.helper';
import StatementSelection from '@deps/components/otp-send-document/statement-selection';
import { RadioItem } from '@deps/components/radio/radio';
import { TranslationFiles } from '@deps/config/translations';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import TabGroupContainer from '@deps/containers/tab-group-container/tab-group';
import { CorrespondenceProvider } from '@deps/contexts/CorrespondenceContext';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { AttachmentDetails, CorrespondenceFormParts, TransactionTypes } from '@deps/models/case/correspondence';
import { PolicyDocument } from '@deps/models/case/document';
import { CommunicationTypes, SendDocumentFormType } from '@deps/models/case/send-document';
import { StatementTypes } from '@deps/models/case/send-statement';
import { Policy } from '@deps/models/policy/sor-policy';
import { UserPermission } from '@deps/models/user-profile';
import { getApplicableStatementsSSR, sendCommunication } from '@deps/queries/api/c2web';
import { getPolicyDetailsSsr } from '@deps/queries/api/policies';
import { SegmentPageName, SegmentTrackedPageProps } from '@deps/types/segment-analytics';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { logWarn, logError, getUserInfoFromUser, parseErrorInformation, logInfo } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

interface SendCorrespondenceProps extends SegmentTrackedPageProps {
    policy: Policy;
    shouldShowCaseButton: FeatureFlags;
    shouldShowEmailFaxOption: FeatureFlags;
    shouldShowMailOption: FeatureFlags;
    applicableStatement: StatementTypes[];
}

const SendCorrespondence = ({
    policy,
    shouldShowCaseButton,
    shouldShowEmailFaxOption,
    shouldShowMailOption,
    user,
    applicableStatement,
}: SendCorrespondenceProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: '' });
    const [statements, setStatements] = useState<PolicyDocument[]>([]);
    const { ctiCallNumber, correlationId } = router.query;

    useSegmentPageTracker(user, SegmentPageName.SendCorrespondence, { ctiCallNumber, correlationId, policyNumber: policy.policyNumber });

    const formSelectionLabel = t('contactCenter.sendStatement.tabs.statementSelection');
    const correspondenceLabel = t('contactCenter.sendStatement.tabs.correspondence');
    const confirmLabel = t('contactCenter.sendStatement.tabs.confirm');

    const communicationTypes = useMemo(
        () => [
            {
                label: t('sendDocument.correspondence.email'),
                value: CommunicationTypes.Email,
                disabled: !shouldShowEmailFaxOption,
            },
            {
                label: t('sendDocument.correspondence.fax'),
                value: CommunicationTypes.Fax,
                disabled: !shouldShowEmailFaxOption,
            },
            {
                label: t('sendDocument.correspondence.mail'),
                value: CommunicationTypes.Mail,
                disabled: !shouldShowMailOption,
            },
        ],
        [shouldShowEmailFaxOption, shouldShowMailOption, t]
    );
    const [communicationOptions] = useState<RadioItem[]>(communicationTypes);

    const handleSubmitRequest = async (state: CorrespondenceFormParts) => {
        const attachments: AttachmentDetails[] = statements.map(statement => {
            return {
                transactionType: TransactionTypes.Statements,
                transactionSubType: statement.documentType,
                formId: statement.documentID || '',
                displayName: statement.displayName,
                formName: statement.displayName,
                attachmentType: statement.documentType,
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
                <StatementSelection
                    applicableStatement={applicableStatement}
                    policy={policy}
                    statements={statements}
                    setStatements={setStatements}
                />
            ),
            screenReaderLabel: formSelectionLabel,
            index: 0,
            text: formSelectionLabel,
        },
        {
            ariaLabel: correspondenceLabel,
            component: <Correspondence communicationOptions={communicationOptions} policy={policy} submitRequest={handleSubmitRequest} />,
            screenReaderLabel: correspondenceLabel,
            index: 1,
            text: correspondenceLabel,
        },
        {
            ariaLabel: confirmLabel,
            component: <Confirm shouldShowCaseButton={shouldShowCaseButton} />,
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
            logWarn('getServerSidePropsSendStatementPage::Access token expired', {
                ...parseErrorInformation(e),
                file: 'utils/page',
                function: 'getServerSidePropsSendStatementPage',
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
                logInfo('contact-center/send-statement/policy not found', { policyNumber, planCode });
                return {
                    redirect: {
                        destination: '/404',
                        permanent: false,
                    },
                };
            }
            const applicableStatements = (await getApplicableStatementsSSR(planCode, accessToken, userInfoForLogging)) || [];
            const shouldShowEmailFaxOption = featureFlagDecisions?.[FEATURE_FLAGS.SEND_STATEMENT_SHOW_EMAIL_FAX_Option];
            const key = `SEND_CORRESPONDENCE_SHOW_Mail_${policy.carrierId}` as keyof typeof FEATURE_FLAGS;
            const shouldShowMailOption = featureFlagDecisions?.[FEATURE_FLAGS[key]];

            return {
                props: {
                    ...translations,
                    policy,
                    shouldShowCaseButton: shouldShowCaseButton ?? false,
                    shouldShowEmailFaxOption: shouldShowEmailFaxOption ?? false,
                    shouldShowMailOption: shouldShowMailOption ?? false,
                    user,
                    applicableStatement: applicableStatements,
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

export default SendCorrespondence;
