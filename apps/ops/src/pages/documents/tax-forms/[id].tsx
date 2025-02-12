import FormViewer from '@deps/pages/contact-center/document/tax-forms/[formId]/index';

import { getAccessToken, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { TranslationFiles } from '@deps/config/translations';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { getUserData } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { logWarn, parseErrorInformation } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: async (context: GetServerSidePropsContext) => {
        const user = await getUserData(context);
        const { locale = DEFAULT_LOCALE, params, res, req, query } = context;
        let accessToken;
        try {
            accessToken = (await getAccessToken(req, res)).accessToken;
        } catch (e) {
            logWarn('documents:: Access token expired', {
                ...parseErrorInformation(e),
                file: 'documents',
                function: 'getServerSideProps',
            });
            return serverSidePropsLogout();
        }

        const formId = (params?.id as string) || '';

        if (!formId) {
            return {
                redirect: {
                    destination: '/406',
                    permanent: false,
                },
            };
        }

        try {
            const { contractNumber, clientCode, fChar, taxYear } = query;

            const translations = await serverSideTranslations(
                locale,
                [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
                nextI18nextConfig,
                ALL_LOCALES
            );

            return {
                props: {
                    locale,
                    ...translations,
                    formId: Number(formId),
                    contractNumber,
                    carrierCode: clientCode,
                    fChar,
                    taxYear,
                },
            };
        } catch (e) {
            return {
                props: {},
            };
        }
    },
});
export default FormViewer;
