import { getAccessToken } from '@auth0/nextjs-auth0';
import {
    Icon,
    IconType,
    TabContent,
    TabGroup,
    TabList,
    TabTrigger,
} from '@zinnia/bloom/components';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CompleteCase } from '@deps/components/test-harness/complete-case';
import { TranslationFiles } from '@deps/config/translations';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { getUserData } from '@deps/helpers/query-data.helpers';
import { DEFAULT_LOCALE, ALL_LOCALES } from '@deps/helpers/routing.helpers';
import {
    withPageAuthAndLogging,
    logWarn,
    parseErrorInformation,
} from '@deps/utils/server-logging';
import { toTitleCase } from '@deps/utils/strings';
import { allowTestHarness } from '@deps/utils/test-harness/utils';
import nextI18nextConfig from 'next-i18next.config';

import { CreatePolicy } from '../../components/test-harness/create-policy';

export enum TestHarnessTabs {
    CREATE_POLICY = 'create-policy',
    COMPLETE_CASE = 'complete-case',
}

const ZinniaLiveTestHarness = () => {
    const { t } = useTranslation();
    const { bulkCheckComplete, hasTestHarnessAccess } = usePermissionsContext();
    const testHarnessAllowed = allowTestHarness(hasTestHarnessAccess);
    const [tabVal, setTabVal] = useState(TestHarnessTabs.CREATE_POLICY);

    if (!bulkCheckComplete) {
        return null;
    }

    if (!testHarnessAllowed) {
        return (
            <div>
                <h1 className="typography-desktop-headline-1-d">
                    Access Denied
                </h1>
                <p className="typography-desktop-body-1-d">
                    You do not have permission to access this page.
                </p>
            </div>
        );
    }

    return (
        <div>
            <h1 className="typography-desktop-headline-1-d">
                {t('testHarness.h1')}
            </h1>
            <p className="typography-desktop-body-1-d">
                {t('testHarness.description')}
            </p>

            <TabGroup
                defaultValue={tabVal}
                value={tabVal}
                activationMode="manual"
                onValueChange={(val) => setTabVal(val as TestHarnessTabs)}
            >
                <TabList className="mt-2">
                    <TabTrigger value={TestHarnessTabs.CREATE_POLICY}>
                        <Icon
                            type={IconType.DOCUMENT_TEXT}
                            width={24}
                            height={24}
                            className="hidden lg:block"
                        />{' '}
                        {toTitleCase('Create Policy')}
                    </TabTrigger>

                    <TabTrigger value={TestHarnessTabs.COMPLETE_CASE}>
                        <Icon
                            type={IconType.DOCUMENT_TEXT}
                            width={24}
                            height={24}
                            className="hidden lg:block"
                        />{' '}
                        {toTitleCase('Complete Case')}
                    </TabTrigger>
                </TabList>
                <TabContent value={TestHarnessTabs.CREATE_POLICY}>
                    <CreatePolicy />
                </TabContent>
                <TabContent value={TestHarnessTabs.COMPLETE_CASE}>
                    <CompleteCase />
                </TabContent>
            </TabGroup>
        </div>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            // Get the user object from the Auth0 Session
            const user = await getUserData(context);
            const { locale = DEFAULT_LOCALE, res, req } = context;
            try {
                (await getAccessToken(req, res)).accessToken;
            } catch (e) {
                logWarn('policies/index:: Access token expired', {
                    ...parseErrorInformation(e),
                    ...loggingContext,
                });
                return serverSidePropsLogout();
            }

            const translations = await serverSideTranslations(
                locale,
                [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
                nextI18nextConfig,
                ALL_LOCALES
            );

            return {
                props: {
                    locale,
                    user,
                    ...translations,
                },
            };
        },
    },
    { file: 'policies/index', function: 'getServerSideProps', page: 'policies' }
);

export default ZinniaLiveTestHarness;
