import { getAccessToken, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { TranslationFiles } from '@deps/config/translations';
import AddressChangeContainer from '@deps/containers/address-change-container/address-change-container';
import { AddressChangeProvider } from '@deps/containers/address-change-container/address-change-provider';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { DocumentData, DocumentType } from '@deps/models/case/document';
import { ProcessType } from '@deps/models/case/enums';
import { Carrier } from '@deps/models/case/withdrawal/case';
import { Policy } from '@deps/models/policy/sor-policy';
import { UserPermission } from '@deps/models/user-profile';
import { getDocumentV2SSR } from '@deps/queries/api/documents';
import { getPolicyDetailsSsr, searchPolicySSR } from '@deps/queries/api/policies';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { isFormFeatureEnabled } from '@deps/utils/optimizely/utils';
import { getUserInfoFromUser, logError, logInfo, logWarn, parseErrorInformation } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

import { ERROR_CODES } from '../create-case/error';

interface AddressChangeProps {
    policy: Policy;
    document: DocumentData;
    planCode: string;
    featureFlagDecisions: FeatureFlags;
}

const AddressChange = ({ policy, document, planCode }: AddressChangeProps) => {
    return (
        <div className="flex w-full flex-col overflow-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
            <AddressChangeProvider>
                <AddressChangeContainer policy={policy} document={document} planCode={planCode} />
            </AddressChangeProvider>
        </div>
    );
};

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: async (context: GetServerSidePropsContext) => {
        const user = await getUserData(context);
        const { locale = DEFAULT_LOCALE, query, req, res } = context;
        const policyNumber = (query?.policyNumber as string) || '';
        const documentNumber = (query.doc as string) || '';
        const clientId = (query.clientId as string) || '';
        const featureFlagDecisions: FeatureFlags = await optimizelyService.getFeatureFlagDecisions(user.sub);

        let accessToken;
        try {
            accessToken = (await getAccessToken(req, res)).accessToken;
        } catch (e) {
            logWarn('getServerSidePropsAddressChangePage::Access token expired', {
                ...parseErrorInformation(e),
                file: 'utils/page',
                function: 'getServerSidePropsAddressChangePage',
            });
            return serverSidePropsLogout();
        }
        // Create a permissions object to pass to the page, strongly typed using the enum.
        const doesUserHasPagePermissions = await doesUserHavePagePermissions(accessToken, user, UserPermission.AllowReadOtpRenewals);
        if (!doesUserHasPagePermissions) {
            return {
                redirect: {
                    destination: '/403',
                    permanent: false,
                },
            };
        }

        // If feature flag is not enabled, redirect to error page
        if (!isFormFeatureEnabled(ProcessType.ADDRESS_CHANGE, clientId, featureFlagDecisions)) {
            logWarn('address-change::Feature flag not enabled', { documentNumber, policyNumber, clientId });
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
            const response = await searchPolicySSR(policyNumber, [clientId.toUpperCase() as Carrier], accessToken, 1, 0);
            const planCode = response ? response[0]?.planCode : null;
            if (!planCode) {
                logInfo('address-change::Plan code not found', { documentNumber, policyNumber, clientId });
                return {
                    redirect: {
                        destination: `/create-case/error?errorCode=${ERROR_CODES.RENEWAL_FORM_PLAN_CODE}`,
                        permanent: false,
                    },
                };
            } else {
                logInfo('address-change::Plan code found', { documentNumber, policyNumber, clientId, planCode });
            }

            const document = documentNumber
                ? await getDocumentV2SSR(documentNumber, DocumentType.AddressChange, clientId.toUpperCase(), accessToken as string)
                : null;
            const policy = await getPolicyDetailsSsr(policyNumber, planCode, accessToken, userInfoForLogging, true);

            if (!policy) {
                logInfo('address-change::Policy not found', { documentNumber, policyNumber, planCode, clientId });
                return {
                    redirect: {
                        destination: `/create-case/error?errorCode=${ERROR_CODES.POLICY_NOT_FOUND}`,
                        permanent: false,
                    },
                };
            }
            logInfo('address-change::Policy details found', { documentNumber, policyNumber, clientId, planCode });

            return {
                props: {
                    ...translations,
                    policy,
                    document,
                    planCode,
                },
            };
        } catch (error) {
            logError('getServerSidePropsAddressChangePage', { ...parseErrorInformation(error), policyNumber, documentNumber, clientId });
            return {
                props: {},
            };
        }
    },
});

export default AddressChange;
