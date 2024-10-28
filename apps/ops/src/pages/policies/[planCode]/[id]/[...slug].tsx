import { getAccessToken, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { deleteCookie, getCookie, setCookie, hasCookie } from 'cookies-next';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useState } from 'react';

import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import { PageHead } from '@deps/components/page-title';
import PolicyLayout from '@deps/components/policy-layout';
import { TranslationFiles } from '@deps/config/translations';
import AnnuitizationSubPage from '@deps/containers/annuitization-sub-page';
import CoverageSubPage from '@deps/containers/coverage-sub-page';
import LoansSubPage from '@deps/containers/loans-sub-page/loans-sub-page';
import PeopleSubPage from '@deps/containers/people-sub-page';
import PersonSubPage from '@deps/containers/person-sub-page';
import PolicyDetailsContainer from '@deps/containers/policy-details/policy-details';
import PolicyDetailsSubPage from '@deps/containers/policy-details-sub-page';
import PolicyExtrasSubPage from '@deps/containers/policy-extras-sub-page/policy-extras-sub-page';
import PremiumsSubPage from '@deps/containers/premiums-sub-page';
import DocumentsSubPage from '@deps/containers/subpages/documents-sub-page/documents-sub-page';
import FundsSubPage from '@deps/containers/subpages/funds-sub-page';
import HistorySubPage from '@deps/containers/subpages/history-sub-page/history-sub-page';
import WithdrawalsSubPage from '@deps/containers/withdrawals-sub-page/withdrawals-sub-page';
import { PeopleRolesFilterProvider } from '@deps/contexts/PeopleRolesFilter';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import usePageTracker from '@deps/hooks/usePageTracker';
import { PolicyAllOfPartiesItem, Policy } from '@deps/models/policy/sor-policy';
import { UserPermission, UserProfile } from '@deps/models/user-profile';
import { fetchPolicy } from '@deps/queries/api/policies';
import { MOCK_COOKIE_KEY, PREV_POLICY_COOKIE_KEY } from '@deps/queries/api-utils/serverClientUtils';
import { getMockPolicy } from '@deps/services/mocks/mock-policy.helper';
import { logError, logWarn, parseErrorInformation } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

interface PolicyPageProps {
    policy: Policy;
    permissions: {
        [UserPermission.AllowReadPolicyAdmin]: boolean;
        [UserPermission.AllowEditPolicy]: boolean;
    };
    selectedPolicyParty?: PolicyAllOfPartiesItem;
    user: UserProfile;
}

interface PreviousPolicy {
    unmockedPlanCode: string;
    unmockedId: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
const PolicyDetailsPage: React.FC<PolicyPageProps> = ({ user }) => {
    const router = useRouter();
    const { query } = router;
    const perms = usePermissionsContext();
    const { id, slug, planCode } = query;

    const [policy, setPolicy] = useState<Policy | null>(null);
    const [refreshPolicy, setRefreshPolicy] = useState<any>(() => {
        return noop;
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [canEditPolicy, setCanEditPolicy] = useState(false);

    usePageTracker(user, 'Policy Details', {
        planCode: planCode,
        policyNumber: id,
    });

    const getPolicy = async () => {
        setLoading(true);
        try {
            // Fetch policy
            const data = await fetchPolicy(id as string, planCode as string);
            if (!data) {
                router.push('/404');
                return;
            }

            setPolicy(data);
        } catch (error) {
            console.error('an error occurred', error);
            setError(error as Error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isMounted) {
            setIsMounted(true);
        }
        return () => {
            setIsMounted(false);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Pass in true to getMockPolicy to return an IUL policy
        const mockPolicy = getMockPolicy();
        const mockPlanCode = mockPolicy.product?.planCode;
        const mockId = mockPolicy.policyNumber;
        const isMock = id == mockId && planCode == mockPlanCode;

        if (hasCookie(MOCK_COOKIE_KEY) && !isMock) {
            setCookie(PREV_POLICY_COOKIE_KEY, {
                unmockedId: id,
                unmockedPlanCode: planCode,
            });
        }

        setRefreshPolicy(() => {
            return async () => {
                try {
                    const data = await fetchPolicy(id as string, planCode as string);
                    if (data) {
                        setPolicy(data);
                    }
                } catch (e) {
                    console.error('Error refreshing policy', e);
                }
            };
        });

        /*
            If mock is turned off, but our id and planCode from the query params are still set to the mock values, we either should redirect back to the
            previous policy that was being looked at IF there was one, which we check for in our cookies. If not, just go back to policy search.
        */
        if (isMock && !hasCookie(MOCK_COOKIE_KEY)) {
            const previousPolicyCookie = getCookie(PREV_POLICY_COOKIE_KEY);
            // Here we build the url to redirect back to if we had browsed a previous policy before turning on the mock.
            // We check if slug[0] exists. If it does, add it to the path. Then we check if slug[1] exists. If it does, add it to the path.
            const previousPath = `${slug && slug[0] ? slug[0] : ''}${slug && slug[1] ? `/${slug[1]}` : ''}`;
            const { unmockedId, unmockedPlanCode }: PreviousPolicy = previousPolicyCookie ? JSON.parse(previousPolicyCookie) : {};

            if (previousPolicyCookie) {
                const newUrl = `/policies/${unmockedPlanCode}/${unmockedId}/${previousPath}`;
                router.push(newUrl);
            } else {
                router.push('/policies');
            }
        } else if (id && isMounted) {
            if (!isMock && !hasCookie(MOCK_COOKIE_KEY)) {
                deleteCookie(PREV_POLICY_COOKIE_KEY);
            }
            getPolicy();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isMounted]);

    useEffect(() => {
        const getCanEditPolicy = async () => {
            const flag = await perms.canEditPolicy(UserPermission.AllowEditPolicy, planCode, policy?.policyNumber);
            setCanEditPolicy(flag);
        };
        if (planCode && policy) {
            getCanEditPolicy();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [planCode, policy]);

    if (loading) {
        return (
            <PolicyLayout loading={true}>
                <div className="flex h-[500px] w-full items-center justify-center">
                    <PageLoader variant={PageLoaderVariant.Center} />
                </div>
            </PolicyLayout>
        );
    }

    if (error) return <PolicyLayout>Error: {JSON.stringify(error)}</PolicyLayout>;

    if (!policy || policy === undefined) {
        router.push('/404');
        return (
            <PolicyLayout>
                <PageLoader />
            </PolicyLayout>
        );
    }

    let subPageContent = null;
    let subPageTitleKey = '';

    // policies/id/... with no slug
    if (!slug || slug.length === 0) {
        subPageContent = <PolicyDetailsSubPage />;
        subPageTitleKey = 'policyDetails';
    } else if (Array.isArray(slug)) {
        // policies/id/slug
        switch (slug[0]) {
            case 'people':
                // policies/id/people/personId or policies/id/people
                subPageContent = slug[1] ? <PersonSubPage editable={canEditPolicy} partyId={slug[1]} /> : <PeopleSubPage />;
                subPageTitleKey = slug[1] ? 'partyDetails' : 'people';
                break;
            case 'transactions':
            case 'policy':
                if (slug[1] === 'coverage') {
                    subPageContent = <CoverageSubPage policy={policy} />;
                    subPageTitleKey = 'coverage';
                }

                if (slug[1] === 'policy-details') {
                    subPageContent = <PolicyDetailsContainer />;
                    subPageTitleKey = 'policyDetails';
                }

                if (slug[1] === 'policy-extras') {
                    subPageContent = <PolicyExtrasSubPage />;
                    subPageTitleKey = 'policyExtras';
                }

                if (slug[1] === 'funds') {
                    const p = new PolicyDetails(policy);
                    subPageContent = <FundsSubPage policy={p} />;
                    subPageTitleKey = 'funds';
                }
                if (slug[1] === 'premiums') {
                    subPageContent = <PremiumsSubPage />;
                    subPageTitleKey = 'premiums';
                }

                if (slug[1] === 'withdrawals') {
                    subPageContent = <WithdrawalsSubPage policy={policy} />;
                    subPageTitleKey = 'withdrawals';
                }

                if (slug[1] === 'loans') {
                    subPageContent = <LoansSubPage policy={policy} />;
                    subPageTitleKey = 'loans';
                }

                if (slug[1] === 'annuitization') {
                    subPageContent = <AnnuitizationSubPage />;
                    subPageTitleKey = 'annuitization';
                }
                break;
            case 'history':
                subPageContent = <HistorySubPage />;
                subPageTitleKey = 'history';
                break;
            case 'documents':
                subPageContent = <DocumentsSubPage policy={policy} />;
                subPageTitleKey = 'documents';
                break;
            default:
                subPageContent = <PolicyDetailsContainer />;
                subPageTitleKey = 'policyDetails';
                break;
        }
    }

    return (
        <PolicyLayout policyDetails={policy}>
            <PolicyData.Provider value={{ policy, policyDetails: new PolicyDetails(policy), refreshPolicy }}>
                {/* Only the sub pages re-render on filter changes */}
                <PeopleRolesFilterProvider>
                    <PageHead titleKey={subPageTitleKey} />
                    {subPageContent}
                </PeopleRolesFilterProvider>
            </PolicyData.Provider>
        </PolicyLayout>
    );
};

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: async (context: GetServerSidePropsContext) => {
        // Get the user object from the Auth0 Session
        const user = await getUserData(context);
        const { locale = DEFAULT_LOCALE, res, req } = context;
        let accessToken;
        try {
            accessToken = (await getAccessToken(req, res)).accessToken;
        } catch (e) {
            logWarn('policies/:id/:slug:: Access token expired', {
                ...parseErrorInformation(e),
                file: 'policies/:id/:slug',
                function: 'getServerSideProps',
            });
            return serverSidePropsLogout();
        }

        // Create a permissions object to pass to the page, strongly typed using the enum.
        const permissions = {
            [UserPermission.AllowReadPolicyAdmin]: false,
        };

        // We can use the enum to access the permissions object.
        permissions[UserPermission.AllowReadPolicyAdmin] = await doesUserHavePagePermissions(
            accessToken,
            user,
            UserPermission.AllowReadPolicyAdmin
        );

        // If they can't read Policy Admin there's no point in continuing. Redirect to 403 Forbidden.
        if (!permissions[UserPermission.AllowReadPolicyAdmin]) {
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

            return {
                props: {
                    ...translations,
                    user,
                },
            };
        } catch (error) {
            // TODO: Perhaps redirect to a 500 page?
            logError('policies/:id/:slug', {
                ...parseErrorInformation(error),
                file: 'policies/:planCode/:id/:slug',
                function: 'getServerSideProps',
            });

            return {
                redirect: {
                    destination: '/404',
                    permanent: false,
                },
            };
        }
    },
});

export default PolicyDetailsPage;
