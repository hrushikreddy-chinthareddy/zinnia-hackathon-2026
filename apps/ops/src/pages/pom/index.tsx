import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { Pom } from '@zinnia/pom';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import nextI18nextConfig from 'next-i18next.config';

function POM() {
    const { t } = useTranslation('pom');
    return <Pom translations={t} />;
}

export default POM;

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: async (context: GetServerSidePropsContext) => {
        const { locale = DEFAULT_LOCALE } = context;

        const translations = await serverSideTranslations(locale, [TranslationFiles.POM], nextI18nextConfig, ALL_LOCALES);

        return {
            props: {
                locale,
                ...translations,
            },
        };
    },
});
