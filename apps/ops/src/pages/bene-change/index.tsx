import { getAccessToken } from '@auth0/nextjs-auth0';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { TranslationFiles } from '@deps/config/translations';
import BeneChangeContainer from '@deps/containers/bene-change/bene-change-container';
import { BeneChangeProvider } from '@deps/containers/bene-change/bene-change-provider';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { doesUserHavePagePermissions } from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { DocumentData, DocumentType } from '@deps/models/case/document';
import { Carrier } from '@deps/models/case/withdrawal/case';
import { Policy } from '@deps/models/policy/sor-policy';
import { UserPermission } from '@deps/models/user-profile';
import { getDocumentV2SSR } from '@deps/queries/api/documents';
import { getPolicyDetailsSsr, searchPolicySSR } from '@deps/queries/api/policies';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';
import { logError, logInfo, logWarn, parseErrorInformation, withPageAuthAndLogging } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

import { ERROR_CODES } from '../create-case/error';

interface AddressChangeProps {
    policy: Policy;
    document: DocumentData;
    planCode: string;
    featureFlagDecisions: FeatureFlags;
}

const BeneChange = ({ policy, document, planCode }: AddressChangeProps) => {
    return (
        <div className="flex w-full flex-col overflow-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
            <BeneChangeProvider>
                <BeneChangeContainer policy={policy} document={document} planCode={planCode} />
            </BeneChangeProvider>
        </div>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            const { locale = DEFAULT_LOCALE, query, req, res } = context;
            const policyNumber = (query?.policyNumber as string) || '';
            const documentNumber = (query.doc as string) || '';
            const clientId = (query.clientId as string) || '';
            // const featureFlagDecisions: FeatureFlags = await getFeatureFlagDecisions(user.sub);

            let accessToken;
            try {
                accessToken = (await getAccessToken(req, res)).accessToken;
            } catch (e) {
                logWarn('getServerSidePropsAddressChangePage::Access token expired', {
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
            /*if (!isFormFeatureEnabled(ProcessType.ADDRESS_CHANGE, clientId, featureFlagDecisions)) {
            logWarn('address-change/:id::feature flag not enabled', { documentNumber, policyNumber, clientId });
            return {
                redirect: {
                    destination: '/403',
                    permanent: false,
                },
            };
        }*/

            try {
                const translations = await serverSideTranslations(
                    locale,
                    [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
                    nextI18nextConfig,
                    ALL_LOCALES
                );

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
                    logInfo('address_change/:id::Plan code not found', loggingContext);
                    return {
                        redirect: {
                            destination: `/create-case/error?errorCode=${ERROR_CODES.RENEWAL_FORM_PLAN_CODE}`,
                            permanent: false,
                        },
                    };
                } else {
                    logInfo('address_change/:id::Plan code found', loggingContext);
                }

                const document = documentNumber
                    ? await getDocumentV2SSR(
                          documentNumber,
                          DocumentType.AddressChange,
                          clientId.toUpperCase(),
                          accessToken as string,
                          loggingContext
                      )
                    : null;
                const policy = await getPolicyDetailsSsr(policyNumber, planCode, accessToken, loggingContext, true);

                if (!policy) {
                    return {
                        redirect: {
                            destination: '/404',
                            permanent: false,
                        },
                    };
                }

                return {
                    props: {
                        ...translations,
                        policy,
                        document,
                        planCode,
                    },
                };
            } catch (error) {
                logError('getServerSidePropsAddressChangePage', { ...parseErrorInformation(error), ...loggingContext });
                return {
                    props: {},
                };
            }
        },
    },
    { file: 'bene-change/index', function: 'getServerSideProps', page: 'bene-change' }
);

export default BeneChange;
