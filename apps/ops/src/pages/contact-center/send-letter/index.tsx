import { getAccessToken } from '@auth0/nextjs-auth0';
import { useQuery } from '@tanstack/react-query';
import { Policy } from '@zinnia/api-types/types/sor';
import { SelectProps } from '@zinnia/bloom/components';
import router from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useState } from 'react';

import Confirm from '@deps/components/otp-send-correspondence/confirm';
import CorrespondenceSelection from '@deps/components/otp-send-correspondence/correspondence-selection';
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
import { AdhocLetterRequestBody } from '@deps/models/case/correspondence';
import { sendAdhocLetter } from '@deps/queries/api/c2web';
import { getPolicyDetailsSsr } from '@deps/queries/api/policies';
import { getCorrespondenceDocuments } from '@deps/queries/tanstack/correspondenceQueries/correspondence-queries';
import {
    SegmentPageName,
    SegmentTrackedPageProps,
} from '@deps/types/segment-analytics';
import {
    logWarn,
    logError,
    parseErrorInformation,
    logInfo,
    withPageAuthAndLogging,
} from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

interface SendCorrespondenceProps extends SegmentTrackedPageProps {
    policy: Policy;
}

const SendCorrespondence = ({ policy, user }: SendCorrespondenceProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const { ctiCallNumber, correlationId } = router.query;
    const [selectedLetterType, setSelectedLetterType] = useState('');
    const [letterOptions, setLetterOptions] = useState<SelectProps['options']>(
        []
    );
    const [hasSubmitError, setSubmitError] = useState(false);

    const planCode = policy.product?.planCode || '';
    const carrierCode = policy.carrierId || '';
    const policyNumber = policy.policyNumber || '';

    const { data, isLoading: loadingCaseDocuments } = useQuery({
        queryKey: ['getCorrespondenceDocuments', planCode, carrierCode],
        queryFn: () => getCorrespondenceDocuments(planCode, carrierCode),
    });

    useEffect(() => {
        if (data && Array.isArray(data)) {
            // The requirement of which letter types are coming from DEPU-5364, those 5 are the only ones with EventName in the response object
            // so instead of creating an enum/const on the frontend with those types, we're filtering down by EventName
            const filteredLetterOptions = data.filter(
                (letterType) => letterType.EventName
            );
            const formattedLetters = filteredLetterOptions.map((letterType) => {
                return {
                    textValue: t([
                        `contactCenter.sendCorrespondence.letterTypes.${letterType.EventName}`,
                        letterType.DocumentName,
                    ]),
                    value: letterType.EventName,
                };
            });
            setLetterOptions(formattedLetters);
        }
    }, [data, t]);

    useSegmentPageTracker(user, SegmentPageName.SendCorrespondence, {
        ctiCallNumber,
        correlationId,
        policyNumber: policy.policyNumber,
    });

    const handleLetterSelection = (val: string) => {
        setSelectedLetterType(val);
    };

    const handleSubmitRequest = async () => {
        const requestBody: AdhocLetterRequestBody = {
            correlationId: correlationId as string,
            eventType: selectedLetterType,
            carrier: carrierCode,
        };

        try {
            setSubmitError(false);
            return await sendAdhocLetter(requestBody, policyNumber, planCode);
        } catch (error) {
            setSubmitError(true);
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error('An unknown error occurred');
            }
        }
    };

    const formSelectionLabel = t(
        'contactCenter.sendCorrespondence.tabs.sendCorrespondence'
    );
    const confirmLabel = t('contactCenter.sendCorrespondence.tabs.confirm');

    const steps: Step[] = [
        {
            component: (
                <CorrespondenceSelection
                    policy={policy}
                    onSelection={handleLetterSelection}
                    submitRequest={handleSubmitRequest}
                    letterOptions={letterOptions}
                    isLoading={loadingCaseDocuments}
                ></CorrespondenceSelection>
            ),
            screenReaderLabel: formSelectionLabel,
            index: 0,
            text: formSelectionLabel,
        },

        {
            component: (
                <Confirm
                    letterType={selectedLetterType}
                    policy={policy}
                    hasError={hasSubmitError}
                />
            ),
            screenReaderLabel: confirmLabel,
            index: 1,
            text: confirmLabel,
        },
    ];

    return (
        <>
            <PageHead titleKey="sendCorrespondence" />
            <CorrespondenceProvider>
                <TabGroupContainer
                    steps={steps}
                    policy={new PolicyDetails(policy)}
                ></TabGroupContainer>
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
                logWarn(
                    'getServerSidePropsSendStatementPage::Access token expired',
                    {
                        ...parseErrorInformation(e),
                        ...loggingContext,
                    }
                );
                return serverSidePropsLogout();
            }

            const translations = await serverSideTranslations(
                locale,
                [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
                nextI18nextConfig,
                ALL_LOCALES
            );
            try {
                const policy = await getPolicyDetailsSsr(
                    policyNumber,
                    planCode,
                    accessToken,
                    loggingContext,
                    false
                );
                const carrierId = policy?.carrierId || '';
                if (!policy || !carrierId) {
                    logInfo(
                        'contact-center/send-letter/policy-not-found',
                        loggingContext
                    );
                    return {
                        redirect: {
                            destination: `/404?title=policyNotFound&planCode=${planCode}&policyNumber=${policyNumber}`,
                            permanent: false,
                        },
                    };
                }

                return {
                    props: {
                        ...translations,
                        policy,
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
        file: 'contact-center/send-letter/index',
        function: 'getServerSideProps',
        page: 'contact-center/send-letter',
    }
);

export default SendCorrespondence;
