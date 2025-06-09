import { getAccessToken } from '@auth0/nextjs-auth0';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { TranslationFiles } from '@deps/config/translations';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import FormViewer from '@deps/pages/contact-center/document/tax-forms/[formId]/index';
import { logWarn, parseErrorInformation, withPageAuthAndLogging } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            const { locale = DEFAULT_LOCALE, params, res, req, query } = context;
            try {
                (await getAccessToken(req, res)).accessToken;
            } catch (e) {
                logWarn('documents:: Access token expired', {
                    ...parseErrorInformation(e),
                    ...loggingContext,
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
                const { contractNumber, clientCode, fChar, taxYear, planCode } = query;

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
                        planCode,
                    },
                };
            } catch (e) {
                return {
                    props: {},
                };
            }
        },
    },
    { file: 'documents/tax-forms/[id]', function: 'getServerSideProps', page: 'documents/tax-forms/:id' }
);
export default FormViewer;
