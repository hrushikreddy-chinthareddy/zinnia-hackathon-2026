import { getAccessToken } from '@auth0/nextjs-auth0';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import PolicyLayout from '@deps/components/policy-layout';
import { TranslationFiles } from '@deps/config/translations';
import BeneChangeContainer from '@deps/containers/bene-change/bene-change-container';
import { BeneChangeProvider } from '@deps/containers/bene-change/bene-change-provider';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { DocumentData, DocumentType } from '@deps/models/case/document';
import { ProcessType } from '@deps/models/case/enums';
import { Carrier } from '@deps/models/case/withdrawal/case';
import { Policy } from '@deps/models/policy/sor-policy';
import { UserPermission } from '@deps/models/user-profile';
import { getDocumentV2SSR } from '@deps/queries/api/documents';
import { getPolicyDetailsSsr, searchPolicySSR } from '@deps/queries/api/policies';
import { SegmentPageName, SegmentTrackedPageProps } from '@deps/types/segment-analytics';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { isFormFeatureEnabled } from '@deps/utils/optimizely/utils';
import { getUserInfoFromUser, logError, logInfo, logWarn, parseErrorInformation, withPageAuthAndLogging } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

import { ERROR_CODES } from '../create-case/error';

interface AddressChangeProps extends SegmentTrackedPageProps {
    policy: Policy;
    document: DocumentData;
    clientId: string;
    planCode: string;
    featureFlagDecisions: FeatureFlags;
}

const BeneChange = ({ policy, document, clientId, planCode, user }: AddressChangeProps) => {
    const { t } = useTranslation();
    const showJointOwner = policy?.carrierId === Carrier.FLIC;

    useSegmentPageTracker(user, SegmentPageName.BeneChange, {
        policyNumber: policy.policyNumber,
        documentNumber: document.documentNumber,
        clientId,
        planCode,
    });

    return (
        <PolicyLayout showJointOwner={showJointOwner} showLink={false} hideSearch={true} policyDetails={policy}>
            <div>
                <BeneChangeProvider>
                    <BeneChangeContainer policy={policy} document={document} planCode={planCode} />
                </BeneChangeProvider>
            </div>
        </PolicyLayout>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            const user = await getUserData(context);
            const { locale = DEFAULT_LOCALE, query, req, res } = context;
            const policyNumber = (query?.policyNumber as string) || '';
            const documentNumber = (query.doc as string) || '';
            const clientId = (query.clientId as string) || '';
            const featureFlagDecisions: FeatureFlags = await optimizelyService.getFeatureFlagDecisions(user.sub, loggingContext);

            let accessToken;
            try {
                accessToken = (await getAccessToken(req, res)).accessToken;
            } catch (e) {
                logWarn('getServerSidePropsReRegPage::Access token expired', {
                    ...parseErrorInformation(e),
                    ...loggingContext,
                });
                return serverSidePropsLogout();
            }
            // Create a permissions object to pass to the page, strongly typed using the enum.
            const doesUserHasPagePermissions = await doesUserHavePagePermissions(
                context,
                UserPermission.AllowReadOtpRenewals,
                loggingContext
            );
            if (!doesUserHasPagePermissions) {
                return {
                    redirect: {
                        destination: '/403',
                        permanent: false,
                    },
                };
            }

            // If feature flag is not enabled, redirect to error page
            if (!isFormFeatureEnabled(ProcessType.REREG, clientId, featureFlagDecisions)) {
                logWarn('re-reg::Feature flag not enabled', loggingContext);
                return {
                    redirect: {
                        destination: '/403',
                        permanent: false,
                    },
                };
            }

            try {
                const translations = await serverSideTranslations(
                    locale,
                    [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
                    nextI18nextConfig,
                    ALL_LOCALES
                );

                const userInfoForLogging = getUserInfoFromUser(user);
                const response = await searchPolicySSR(
                    policyNumber,
                    [clientId.toUpperCase() as Carrier],
                    accessToken,
                    1,
                    0,
                    loggingContext
                );
                const planCode = response ? response[0]?.planCode : null;
                if (!planCode) {
                    logInfo('re-reg::Plan code not found', loggingContext);
                    return {
                        redirect: {
                            destination: `/create-case/error?errorCode=${ERROR_CODES.RENEWAL_FORM_PLAN_CODE}`,
                            permanent: false,
                        },
                    };
                } else {
                    logInfo('re-reg::Plan code found', { ...loggingContext, planCode });
                }

                const document = documentNumber
                    ? await getDocumentV2SSR(
                          documentNumber,
                          DocumentType.ReReg,
                          clientId.toUpperCase(),
                          accessToken as string,
                          loggingContext
                      )
                    : null;
                const policy = await getPolicyDetailsSsr(policyNumber, planCode, accessToken, loggingContext, true);

                if (!policy) {
                    logInfo('re-reg::Policy not found', { ...loggingContext, planCode });
                    return {
                        redirect: {
                            destination: `/create-case/error?errorCode=${ERROR_CODES.POLICY_NOT_FOUND}`,
                            permanent: false,
                        },
                    };
                }

                logInfo('re-reg::Policy details found', { ...loggingContext, planCode });
                return {
                    props: {
                        ...translations,
                        policy,
                        document,
                        planCode,
                        clientId,
                        user,
                    },
                };
            } catch (error) {
                logError('re-reg/:id::getServerSidePropsReRegPage', {
                    ...parseErrorInformation(error),
                    ...loggingContext,
                    docType: DocumentType.ReReg,
                });
                return {
                    props: {},
                };
            }
        },
    },
    { file: 're-reg/index', function: 'getServerSideProps', page: 're-reg' }
);

export default BeneChange;
