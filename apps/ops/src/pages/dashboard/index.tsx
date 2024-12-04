import { getAccessToken, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { QueryClient } from '@tanstack/react-query';
import { TabContent } from '@zinnia/bloom/components';
import { FgaRoles } from '@zinnia/utils';
import clsx from 'clsx';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MultiselectOption } from '@deps/components/autocomplete/autocomplete.types';
import { ActiveApplications } from '@deps/components/dashboard/active-applications/active-applications';
import { BrokerDealerFilter } from '@deps/components/dashboard/broker-dealer-filter/broker-dealer-filter';
import { DashboardTabNav } from '@deps/components/dashboard/dashboard-nav-links';
import IssuedBusiness from '@deps/components/dashboard/issued-business/issued-business';
import { FieldSize } from '@deps/components/fields/field';
import NoNavLayout from '@deps/components/no-nav-layout';
import { PageHead } from '@deps/components/page-title';
import Select from '@deps/components/select/select';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { DashboardResponsiveLayout } from '@deps/containers/dashboard/dashboard-responsive-layout';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { getUserData } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { useIntersectionObserver } from '@deps/hooks/useIntersectionObserver';
import { UserPermission } from '@deps/models/user-profile';
import { DashboardResponseData, fetchAgentsSSR, fetchCompletedCasesByProcessSubTypeSSR } from '@deps/queries/api/dashboard';
import { checkTupleSsr, getCarrierListServerSSR } from '@deps/queries/api/fga';
import { FgaRelation } from '@deps/types/fga';
import { getCarrierListItem, getCarrierNameByClientId, getClientIdsByCarrierName } from '@deps/utils/carriers';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { logWarn, parseErrorInformation } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

import styles from './Dashboard.module.css';

export interface CarrierListItem {
    [key: string]: string;
}

const queryClient = new QueryClient();

const DashboardPage = ({
    authorizedCarriers,
    brokerDealersSSR,
    completedCasesByProcessSubType,
}: {
    authorizedCarriers: string[];
    brokerDealersSSR: DashboardResponseData[];
    completedCasesByProcessSubType: DashboardResponseData[];
}) => {
    const carrierHeaderRef = useRef<HTMLDivElement>(null);
    const {
        isIntersecting: carrierHeaderIsIntersecting,
        ref: sankeyChartRef,
        entry: carrierHeaderEntry,
    } = useIntersectionObserver({
        threshold: 0,
        rootMargin: `${-64}px 0px -100% 0px`,
    });

    const { t } = useTranslation(TranslationFiles.COMMON);

    const [loading, setLoading] = useState<boolean>(false);
    const [brokerDealers, setBrokerDealers] = useState<DashboardResponseData[]>(brokerDealersSSR || []);

    const carrierFilterItems = useMemo(
        () =>
            authorizedCarriers.map((carrierCode: string) => {
                const valueAndDisplay = getCarrierNameByClientId(carrierCode) || carrierCode.toUpperCase();

                return {
                    value: getClientIdsByCarrierName(authorizedCarriers, valueAndDisplay) || carrierCode.toUpperCase(),
                    displayText: valueAndDisplay,
                    label: getCarrierListItem(carrierCode),
                };
            }),
        [authorizedCarriers]
    );

    const [selectedCarriers, setSelectedCarriers] = useState<CarrierListItem>(
        carrierFilterItems.length === 1 ? { [carrierFilterItems[0].value]: carrierFilterItems[0].displayText } : {}
    );
    const [placeholderSelectedCarriers, setPlaceholderSelectedCarriers] = useState<CarrierListItem>(
        carrierFilterItems.length === 1 ? { [carrierFilterItems[0].value]: carrierFilterItems[0].displayText } : {}
    );
    const [selectedBrokerDealers, setSelectedBrokerDealers] = useState<CarrierListItem>(
        brokerDealers?.length === 1 ? { [brokerDealers[0].key]: brokerDealers[0].name } : {}
    );

    const handleSetLoading = useCallback((bool: boolean) => {
        setLoading(bool);
    }, []);

    const getUniqueCarrierFilterItems = (): MultiselectOption[] => {
        const carrierLabels = new Set();

        const uniqueCarrierFilterItems = (
            carrierFilterItems.filter(item => {
                if (carrierLabels.has(item.displayText)) {
                    return false;
                }

                carrierLabels.add(item.displayText);
                return true;
            }) as typeof carrierFilterItems
        ).sort((item1, item2) => item1.displayText.localeCompare(item2.displayText));
        return uniqueCarrierFilterItems;
    };
    const updateCarrierFilters = (value: string, displayText: string) => {
        setPlaceholderSelectedCarriers(prevSelectedCarriers => {
            if (prevSelectedCarriers[value]) {
                delete prevSelectedCarriers[value];
                return { ...prevSelectedCarriers };
            } else {
                return { ...prevSelectedCarriers, [value]: displayText };
            }
        });
    };

    const updateBrokerDealerFilters = (value: string, displayText: string) => {
        setSelectedBrokerDealers(prevSelectedAgents => {
            if (prevSelectedAgents[value]) {
                delete prevSelectedAgents[value];
                return { ...prevSelectedAgents };
            } else {
                return { ...prevSelectedAgents, [value]: displayText };
            }
        });
    };

    const handleOnOpenChange = (open: boolean) => {
        if (!open) {
            setSelectedCarriers(placeholderSelectedCarriers);
        }
    };
    return (
        <DashboardResponsiveLayout>
            <PageHead titleKey="dashboard" />
            <NoNavLayout fullHeight={true} displayTopNavBar={true} size="large">
                <div
                    id="carrier-header"
                    ref={carrierHeaderRef}
                    className={clsx('flex-wrap', styles.filtersHeader, {
                        [styles.pinned as string]:
                            carrierHeaderIsIntersecting || Number(carrierHeaderEntry?.boundingClientRect.bottom) < 64,
                    })}
                >
                    <Typography className="flex items-center" variant={TypographyVariant.H1} data-testid="header-text">
                        {t('caseStatsDashboardTitle')}
                    </Typography>
                    <div className="flex justify-between items-center">
                        <div className="flex nowrap gap-4">
                            <div className="w-52">
                                <Select
                                    isMultiselect
                                    options={getUniqueCarrierFilterItems()}
                                    value={placeholderSelectedCarriers}
                                    onChange={updateCarrierFilters}
                                    size={FieldSize.Small}
                                    placeholder={t('allCarriers') || ''}
                                    disabled={loading || carrierFilterItems.length === 1}
                                    name="carrier-dropdown-btn"
                                    onOpenChange={handleOnOpenChange}
                                />
                            </div>
                            <div className="w-52">
                                <BrokerDealerFilter
                                    brokerDealers={brokerDealers}
                                    selectedBrokerDealers={selectedBrokerDealers}
                                    selectedCarriers={Object.keys(placeholderSelectedCarriers)}
                                    setSelectedBrokerDealers={setBrokerDealers}
                                    updateBrokerDealerFilters={updateBrokerDealerFilters}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <DashboardTabNav>
                    <TabContent className="w-full" value={'active-applications'}>
                        <ActiveApplications
                            sankeyChartRef={sankeyChartRef}
                            selectedBrokerDealers={selectedBrokerDealers}
                            selectedCarriers={selectedCarriers}
                            handleSetLoading={handleSetLoading}
                            loading={loading}
                            carrierHeaderRef={carrierHeaderRef}
                        />
                    </TabContent>
                    <TabContent className="w-full" value={'issued-business'}>
                        <IssuedBusiness
                            authorizedCarriers={authorizedCarriers}
                            brokerDealersSSR={brokerDealers}
                            completedCasesByProcessSubType={completedCasesByProcessSubType}
                        />
                    </TabContent>
                </DashboardTabNav>
            </NoNavLayout>
        </DashboardResponsiveLayout>
    );
};

export default DashboardPage;

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: async (context: GetServerSidePropsContext) => {
        // Get the user object from the Auth0 Session
        const user = await getUserData(context);
        const { locale = DEFAULT_LOCALE, res, req } = context;
        let accessToken;
        try {
            accessToken = (await getAccessToken(req, res)).accessToken;
        } catch (e) {
            logWarn('dashboard/index:: Access token expired', {
                ...parseErrorInformation(e),
                file: 'dashboard/index',
                function: 'getServerSideProps',
            });
            return serverSidePropsLogout();
        }

        const featureFlagDecisions: FeatureFlags = await optimizelyService.getFeatureFlagDecisions(user.sub);
        const doesUserHavePagePermission = await checkTupleSsr(
            `${accessToken}`,
            user.partyId,
            FgaRelation.Party,
            FgaRoles.CASE_STATS_DASHBOARD_ROLE
        );
        if (!doesUserHavePagePermission || !featureFlagDecisions['case-management-case_stats_dashboard']) {
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
        const brokerDealersSSR = await fetchAgentsSSR(accessToken || '');

        const authorizedCarriers = await getCarrierListServerSSR(accessToken || '', user.partyId, UserPermission.AllowReadCaseManagement);
        const completedCasesByProcessSubType = (await fetchCompletedCasesByProcessSubTypeSSR(accessToken || '')).slice(0, 5);

        return {
            props: {
                locale,
                authorizedCarriers,
                brokerDealersSSR,
                ...translations,
                completedCasesByProcessSubType,
            },
        };
    },
});
