import { getAccessToken } from '@auth0/nextjs-auth0';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { TranslationFiles } from '@deps/config/translations';
import { AE_FGA_ROLE } from '@deps/constants/advisors-excel';
import PolicySlug from '@deps/containers/policy-slug/policy-slug';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import {
    doesUserHavePagePermissions,
    getUserData,
} from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { UserPermission } from '@deps/models/user-profile';
import { checkTuplePage } from '@deps/queries/api/server/fga/checkTuple';
import { FgaRelation, FgaRoles } from '@deps/utils/auth';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    FeatureFlags,
    optimizelyService,
} from '@deps/utils/optimizely/optimizely';
import {
    logError,
    logWarn,
    parseErrorInformation,
    withPageAuthAndLogging,
} from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

export type { PolicyPageProps } from '@deps/containers/policy-slug/policy-slug';

const parseSlugToKey = (slug: string[] | undefined): string => {
    if (!slug || slug.length === 0) return 'policyDetails';
    const [alphaSlug, omegaSlug] = slug;
    switch (alphaSlug) {
        case 'people':
            return omegaSlug ? 'partyDetails' : alphaSlug;
        case 'transactions':
        case 'policy':
            // NOTE: policy-extras should map to ridersAndFeatures
            return omegaSlug === 'policy-extras'
                ? 'ridersAndFeatures'
                : omegaSlug.replace(/-([a-z])/g, (_, letter) =>
                      letter.toUpperCase()
                  );
        case 'activity':
        case 'documents':
            return alphaSlug;
        default:
            return 'policyDetails';
    }
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            // Get the user object from the Auth0 Session
            const user = await getUserData(context);
            const { locale = DEFAULT_LOCALE, res, req, query } = context;
            const { slug } = query;

            try {
                (await getAccessToken(req, res)).accessToken;
            } catch (e) {
                logWarn('policies/:id/:slug:: Access token expired', {
                    ...parseErrorInformation(e),
                    ...loggingContext,
                });
                return serverSidePropsLogout();
            }

            // IMH-87188-87186 (186 is the IMH you can view in JIRA)
            const featureFlagDecisions: FeatureFlags =
                await optimizelyService.getFeatureFlagDecisions(
                    user.sub,
                    loggingContext
                );

            if (
                featureFlagDecisions?.[
                    FEATURE_FLAGS.FGA_ENTITY_ZINNIA_LIVE_POLICY_MANAGEMENT
                ]
            ) {
                const hasPermissionToReadPolicyManagement =
                    featureFlagDecisions?.[
                        FEATURE_FLAGS.ENTERPRISE_SEARCH_POLICY
                    ]
                        ? await checkTuplePage(
                              context,
                              FgaRelation.UiAccess,
                              FgaRoles.POLICY_MANAGEMENT_ZL_ENTITY,
                              loggingContext
                          )
                        : await doesUserHavePagePermissions(
                              context,
                              UserPermission.AllowReadPolicyAdmin,
                              loggingContext
                          );
                const isAdvisorsExcel = await checkTuplePage(
                    context,
                    FgaRelation.Party,
                    AE_FGA_ROLE,
                    loggingContext
                );

                if (!isAdvisorsExcel && !hasPermissionToReadPolicyManagement) {
                    return {
                        redirect: {
                            destination: '/403',
                            permanent: false,
                        },
                    };
                }
            }

            try {
                const translations = await serverSideTranslations(
                    locale,
                    [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
                    nextI18nextConfig,
                    ALL_LOCALES
                );

                return {
                    props: {
                        ...translations,
                        user,
                        subPageTitleKey:
                            parseSlugToKey(
                                typeof slug === 'string' ? [slug] : slug
                            ) ?? null,
                    },
                };
            } catch (error) {
                // TODO: Perhaps redirect to a 500 page?
                logError('policies/:id/:slug:: Error fetching translations', {
                    ...parseErrorInformation(error),
                    ...loggingContext,
                });

                return {
                    redirect: {
                        destination: '/404',
                        permanent: false,
                    },
                };
            }
        },
    },
    {
        file: 'policies/[id]/[...slug]',
        function: 'getServerSideProps',
        page: 'policies/:planCode/:id/:...slug',
    }
);

export default PolicySlug;
