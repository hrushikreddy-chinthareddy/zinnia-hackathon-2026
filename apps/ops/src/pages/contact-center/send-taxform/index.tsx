import { getAccessToken } from '@auth0/nextjs-auth0';
import { TaxformResponse } from '@zinnia/api-types/types/documents-v3';
import router from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMemo, useState } from 'react';

import { MultiselectOption } from '@deps/components/autocomplete/autocomplete.types';
import ConfirmComponent from '@deps/components/otp-send-document/confirm';
import Correspondence from '@deps/components/otp-send-document/correspondence';
import { generateCommunicationRequest } from '@deps/components/otp-send-document/correspondence.helper';
import TaxFormsSelection from '@deps/components/otp-send-document/tax-forms-selection';
import { PageHead } from '@deps/components/page-title';
import { TranslationFiles } from '@deps/config/translations';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import TabGroupContainer from '@deps/containers/tab-group-container/tab-group';
import { CorrespondenceProvider } from '@deps/contexts/CorrespondenceContext';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { getUserData } from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { AttachmentType, CorrespondenceFormParts, TransactionSubTypes, TransactionTypes } from '@deps/models/case/correspondence';
import { CommunicationTypes, SendDocumentFormType } from '@deps/models/case/send-document';
import { ALLOWED_TAX_YEARS, DisplayName, TaxForm, TaxFormSelectionDetails } from '@deps/models/case/send-tax-forms';
import { Policy } from '@deps/models/policy/sor-policy';
import { UserProfile } from '@deps/models/user-profile';
import { sendCommunication } from '@deps/queries/api/c2web';
import { getPolicyDetailsSsr } from '@deps/queries/api/policies';
import { SegmentPageName, SegmentTrackedPageProps } from '@deps/types/segment-analytics';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { FEATURE_FLAG_VARIABLES, FEATURE_VARIABLES_CORRESPONDENCE_KEYS } from '@deps/utils/optimizely/variables';
import { logWarn, logError, parseErrorInformation, logInfo, withPageAuthAndLogging } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

interface SendTaxFormsProps extends SegmentTrackedPageProps {
    policy: Policy;
    user: UserProfile;
    shouldShowCaseButton: FeatureFlags;
    shouldShowEmailOption: FeatureFlags;
    shouldShowFaxOption: FeatureFlags;
    shouldShowMailOption: FeatureFlags;
}

const SendTaxForms = ({
    policy,
    user,
    shouldShowCaseButton,
    shouldShowEmailOption,
    shouldShowFaxOption,
    shouldShowMailOption,
}: SendTaxFormsProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: '' });

    const { ctiCallNumber, correlationId } = router.query;

    const currentYear = new Date().getFullYear();
    const taxYears = Array.from({ length: ALLOWED_TAX_YEARS }, (_, i) => currentYear - i).reverse();

    const taxYearOptions: MultiselectOption[] = taxYears.map(year => ({
        label: year.toString(),
        value: year.toString(),
        displayText: year.toString(),
    }));

    const [taxFormSelectionDetails, setTaxFormSelectionDetails] = useState<TaxFormSelectionDetails>({} as TaxFormSelectionDetails);

    const [selectedYears, setSelectedYears] = useState<{ [key: string]: string }>({ [currentYear.toString()]: currentYear.toString() });

    useSegmentPageTracker(user, SegmentPageName.SendTaxForms, { ctiCallNumber, correlationId, policyNumber: policy.policyNumber });

    const formSelectionLabel = t('contactCenter.sendTaxForms.tabs.taxFormsSelection');
    const CorrespondenceLabel = t('contactCenter.sendTaxForms.tabs.correspondence');
    const confirmLabel = t('contactCenter.sendTaxForms.tabs.confirm');

    const communicationTypes = useMemo(
        () => [
            {
                label: t('sendDocument.correspondence.email'),
                value: CommunicationTypes.Email,
                disabled: !shouldShowEmailOption,
            },
            {
                label: t('sendDocument.correspondence.fax'),
                value: CommunicationTypes.Fax,
                disabled: !shouldShowFaxOption,
            },
            {
                label: t('sendDocument.correspondence.mail'),
                value: CommunicationTypes.Mail,
                disabled: !shouldShowMailOption,
            },
        ],
        [shouldShowEmailOption, shouldShowFaxOption, shouldShowMailOption, t]
    );

    const handleSubmitRequest = async (state: CorrespondenceFormParts) => {
        const attachments = taxFormSelectionDetails?.selectedTaxForms?.map(formDetail => {
            return {
                transactionType: TransactionTypes.TaxForms,
                transactionSubType: TransactionSubTypes.TaxForms,
                attachmentType: AttachmentType.TaxForms,
                displayName: DisplayName.TaxForms,
                formId: formDetail?.formId ?? '',
                formName: DisplayName.TaxForms,
                taxYear: formDetail?.taxYear ?? '',
                fChar: (formDetail as TaxForm)?.fChar ?? (formDetail as TaxformResponse)?.fchar ?? '',
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
                <TaxFormsSelection
                    policy={policy}
                    taxFormSelectionDetails={taxFormSelectionDetails}
                    setTaxFormSelectionDetails={setTaxFormSelectionDetails}
                    taxYearOptions={taxYearOptions}
                    selectedYears={selectedYears}
                    setSelectedYears={setSelectedYears}
                />
            ),
            screenReaderLabel: formSelectionLabel,
            index: 0,
            text: formSelectionLabel,
        },
        {
            ariaLabel: CorrespondenceLabel,
            component: <Correspondence communicationOptions={communicationTypes} policy={policy} submitRequest={handleSubmitRequest} />,
            screenReaderLabel: CorrespondenceLabel,
            index: 1,
            text: CorrespondenceLabel,
        },
        {
            ariaLabel: confirmLabel,
            component: <ConfirmComponent shouldShowCaseButton={shouldShowCaseButton} formNames={['']} />,
            screenReaderLabel: confirmLabel,
            index: 2,
            text: confirmLabel,
        },
    ];

    return (
        <>
            <PageHead titleKey="sendTaxForm" />
            <CorrespondenceProvider>
                <TabGroupContainer steps={steps} policy={new PolicyDetails(policy)}></TabGroupContainer>
            </CorrespondenceProvider>
        </>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
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
                    ...loggingContext,
                });
                return serverSidePropsLogout();
            }
            const featureFlagDecisions: FeatureFlags = await optimizelyService.getFeatureFlagDecisions(user.sub, loggingContext);

            //  const shouldShowSendTaxFormsPage = featureFlagDecisions?.[FEATURE_FLAGS.SEND_TAX_FORMS];
            const shouldShowCaseButton = featureFlagDecisions?.[FEATURE_FLAGS.SEND_TAX_FORMS_SHOW_CASE_BUTTON];

            const translations = await serverSideTranslations(
                locale,
                [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
                nextI18nextConfig,
                ALL_LOCALES
            );
            try {
                const policy = await getPolicyDetailsSsr(policyNumber, planCode, accessToken, loggingContext, true);
                const carrierId = policy?.carrierId?.toLowerCase() || '';
                if (!policy || !carrierId) {
                    logInfo('contact-center/send-taxforms/policy-not-found', loggingContext);
                    return {
                        redirect: {
                            destination: `/404?title=policyNotFound&planCode=${planCode}&policyNumber=${policyNumber}`,
                            permanent: false,
                        },
                    };
                }

                const mailOptionEnabled = await optimizelyService.getFeatureFlagVariables(
                    FEATURE_FLAG_VARIABLES.SEND_TAX_FORM,
                    FEATURE_VARIABLES_CORRESPONDENCE_KEYS.Mail,
                    user.sub,
                    loggingContext
                );
                const emailOptionEnabled = await optimizelyService.getFeatureFlagVariables(
                    FEATURE_FLAG_VARIABLES.SEND_TAX_FORM,
                    FEATURE_VARIABLES_CORRESPONDENCE_KEYS.Email,
                    user.sub,
                    loggingContext
                );
                const faxOptionEnabled = await optimizelyService.getFeatureFlagVariables(
                    FEATURE_FLAG_VARIABLES.SEND_TAX_FORM,
                    FEATURE_VARIABLES_CORRESPONDENCE_KEYS.Fax,
                    user.sub,
                    loggingContext
                );
                const shouldShowMailOption = Object.keys(mailOptionEnabled).includes(carrierId);
                const shouldShowEmailOption = Object.keys(emailOptionEnabled).includes(carrierId);
                const shouldShowFaxOption = Object.keys(faxOptionEnabled).includes(carrierId);

                return {
                    props: {
                        ...translations,
                        policy,
                        shouldShowCaseButton: shouldShowCaseButton ?? false,
                        user,
                        shouldShowEmailOption: shouldShowEmailOption ?? false,
                        shouldShowFaxOption: shouldShowFaxOption ?? false,
                        shouldShowMailOption: shouldShowMailOption ?? false,
                    },
                };
            } catch (error) {
                logError('getServerSidePropsSendTaxFormsPage', { ...parseErrorInformation(error), ...loggingContext });
                return {
                    props: {},
                };
            }
        },
    },
    { file: 'contact-center/send-taxform/index', function: 'getServerSideProps', page: 'contact-center/send-taxform' }
);

export default SendTaxForms;
