import { getAccessToken } from '@auth0/nextjs-auth0';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import CardInfo from '@deps/components/card/card-info/card-info';
import NoNavLayout from '@deps/components/no-nav-layout';
import { TranslationFiles } from '@deps/config/translations';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { doesUserHavePagePermissions } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { UserPermission } from '@deps/models/user-profile';
import { ReactComponent as ErrorIcon } from '@deps/styles/elements/icons/icons_outlined/exclamation-alert.svg';
import { logWarn, parseErrorInformation, withPageAuthAndLogging } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

import { ERROR_KEYS } from '../create-case/error';

export default function CreateCaseErrorPage() {
    const { t } = useTranslation(undefined, { keyPrefix: 'createCaseError' });
    const router = useRouter();
    const errorCode = router.query?.errorCode || 'default';
    const translationKey = ERROR_KEYS[errorCode as string] || ERROR_KEYS.default;

    return (
        <NoNavLayout>
            <div className="flex h-[500px] w-full items-center justify-center rounded border-2 border-dashed border-semantic-warning bg-white shadow-sm">
                <CardInfo
                    icon={<ErrorIcon className="text-semantic-warning" height={50} width={50} />}
                    title={t(`errorMessaging.${translationKey}.title`)}
                    subtitle={t(`errorMessaging.${translationKey}.subtitle`)}
                    cta={{
                        action: () => {
                            router.replace('/create-case');
                        },
                        text: t('backToCreateCase'),
                    }}
                />
            </div>
        </NoNavLayout>
    );
}

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            const { locale = DEFAULT_LOCALE, req, res } = context;
            try {
                (await getAccessToken(req, res)).accessToken;
            } catch (e) {
                logWarn('create-case/error:: Access token expired', {
                    ...parseErrorInformation(e),
                    ...loggingContext,
                });
                return serverSidePropsLogout();
            }
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

            const translations = await serverSideTranslations(locale, [TranslationFiles.COMMON], nextI18nextConfig, ALL_LOCALES);
            return { props: { locale, ...translations } };
        },
    },
    { file: 'ssw-edit/error', function: 'getServerSideProps', page: 'ssw-edit/error' }
);
