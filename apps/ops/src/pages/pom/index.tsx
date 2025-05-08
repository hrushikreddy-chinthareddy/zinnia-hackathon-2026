import { Pom } from '@zinnia/pom';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import usePomExperience from '@deps/hooks/usePomExperience';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

function POM() {
    const { t } = useTranslation();

    const isPomExperienceFeatureFlagEnabled = usePomExperience();

    if (!isPomExperienceFeatureFlagEnabled) {
        return null;
    }

    return <Pom translations={t} />;
}

export default POM;

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async context => {
            const { locale = DEFAULT_LOCALE } = context;

            const translations = await serverSideTranslations(
                locale,
                [TranslationFiles.COMMON, TranslationFiles.POM],
                nextI18nextConfig,
                ALL_LOCALES
            );

            return {
                props: {
                    locale,
                    ...translations,
                },
            };
        },
    },
    { file: 'pom/index', function: 'getServerSideProps', page: 'pom' }
);
