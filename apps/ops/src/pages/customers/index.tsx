import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    ContactFilterRequest,
    ContactSearchResult,
} from '@xd/api-types/dist/generated-types/contact-management';
import { Button, Pagination } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMemo, useState } from 'react';

import ContactCard from '@deps/components/contact-card/ContactCard';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import {
    doesUserHavePagePermissions,
    getUserData,
} from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { UserPermission } from '@deps/models/user-profile';
import { getContactsQuery } from '@deps/queries/tanstack/contactManagementQueries/contact-management-queries';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    FeatureFlags,
    optimizelyService,
} from '@deps/utils/optimizely/optimizely';
import { logInfo, withPageAuthAndLogging } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

import styles from './styles.module.css';

interface CustomersPageProps {
    locale: string;
}

export default function CustomersPage({}: CustomersPageProps) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const limit = 10;
    const [page, setPage] = useState(0);

    const [sortBy, setSortBy] = useState<ContactFilterRequest['sortBy']>();
    const [sortOrder, setSortOrder] =
        useState<ContactFilterRequest['sortOrder']>();
    const [searchFilters, setSearchFilters] =
        useState<ContactFilterRequest['filters']>();

    const offset = useMemo(() => page * limit, [page, limit]);

    const {
        isLoading: isLoadingContacts,
        isError,
        data: contactsData,
    } = useQuery<ContactSearchResult>({
        queryKey: ['contacts', searchFilters, sortBy, sortOrder, limit, offset],
        queryFn: () =>
            getContactsQuery({
                limit,
                offset,
                sortBy,
                sortOrder,
                filters: searchFilters,
            }),
        placeholderData: () => {
            // BPB - test this out.  Does it work the way we'd want?
            // To keep pagination values when moving between results, use a cached results for the same filters
            return queryClient
                .getQueryData<ContactSearchResult[]>([
                    'contacts',
                    searchFilters,
                ])
                ?.find(Boolean);
        },
    });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Typography variant={TypographyVariant.H1}>
                    {t('contacts.pageTitle')}
                </Typography>
                <Button size="small">{t('contacts.addCustomer')}</Button>
            </div>
            {/* <div className={styles.filterContainer}>Filter Component</div> */}
            <div className={styles.contactsContainer}>
                {isLoadingContacts && <div>Loading...</div>}
                {!isLoadingContacts && !isError && (
                    <>
                        <ul className={styles.contacts}>
                            {contactsData?.data?.map((contact) => (
                                <li key={contact.id}>
                                    <ContactCard contact={contact} />
                                </li>
                            ))}
                        </ul>
                        <div className={styles.paginationContainer}>
                            <Pagination
                                goToPage={setPage}
                                limit={limit}
                                offset={offset}
                                total={contactsData?.total || 0}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            const { locale = DEFAULT_LOCALE, res, req } = context;

            const user = await getUserData(context);

            const featureFlagDecisions: FeatureFlags =
                await optimizelyService.getFeatureFlagDecisions(
                    user.sub,
                    loggingContext
                );

            if (!featureFlagDecisions[FEATURE_FLAGS.MARKET_CONNECT_ENABLED]) {
                logInfo(
                    'customersPage::Feature flag not enabled',
                    loggingContext
                );
                return {
                    redirect: {
                        destination: '/404',
                        permanent: false,
                    },
                };
            }

            // BPB - update to use the correct permission once it is created.
            const doesUserHasPagePermissions =
                await doesUserHavePagePermissions(
                    context,
                    UserPermission.AllowReadCaseManagement,
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
        },
    },
    {
        file: 'customers/index',
        function: 'getServerSideProps',
        page: 'customers/index',
    }
);
