import { getSession } from '@auth0/nextjs-auth0';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Button, { ButtonType } from '@deps/components/button/button';
import { TranslationFiles } from '@deps/config/translations';
import { doesUserHavePagePermissions } from '@deps/helpers/query-data.helper';
import { DEFAULT_LOCALE, setNextLocaleCookie } from '@deps/helpers/routing.helper';
import { UserPermission, UserProfile } from '@deps/models/user-profile';
import { ReactComponent as ZinniaLogo } from '@deps/styles/elements/logos/zinnia-logo.svg';
import { ReactComponent as ZinniaWelcomeArt } from '@deps/styles/elements/welcome-art/zinnia-welcome-art.svg';
import { buildNextPageLoggingContext } from '@deps/utils/server-logging';

import type { GetServerSideProps } from 'next';

const WelcomePage = () => {
    const { t } = useTranslation(TranslationFiles.COMMON, { useSuspense: false });

    return (
        <div className="context-center relative bg-white md:flex md:flex-row">
            <div className="relative hidden h-screen bg-gray-100 mid:block mid:basis-1/3 mid:overflow-hidden">
                <div className="flex h-full items-center justify-end">
                    <div className={'absolute h-[830px] w-[592px] mid:bottom-[66px] mid:left-[42px] mid:top-[66px] welcome-xl:left-1/3'}>
                        <ZinniaWelcomeArt />
                    </div>
                </div>
            </div>

            <div className="relative mt-[21px] flex h-screen w-full content-center justify-center bg-white mid:mt-0 mid:w-auto mid:basis-2/3 lg:ml-24 lg:basis-0 lg:pr-0 xl:ml-32">
                <div className="grid content-center sm:w-[328px] md:w-[328px] lg:w-[532px]">
                    <div className="w-[198px]">
                        <ZinniaLogo />
                    </div>
                    <div className="my-[41px]">
                        <div>
                            <div className="mb-2 font-primary text-lg font-light">
                                {t('welcome.header', { policyPortalName: t('site.name') })}
                            </div>

                            <div className="border-box context-center mt-11 rounded-lg border-2 border-slate-100 p-8 font-secondary lg:flex">
                                <div className="lg:basis-1/2">
                                    <span className="text-base">
                                        <b>{t('welcome.note.prefix')} </b>
                                        {t('welcome.note.text')}
                                    </span>
                                </div>
                                <div className="mt-5 flex justify-center self-center lg:mt-0 lg:basis-1/2">
                                    <a href={t('auth.signIn.link') || '/'} className="appearance-none">
                                        <Button className="!px-6" type={ButtonType.Primary}>
                                            {t('welcome.signInBtn')}
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const getServerSideProps: GetServerSideProps = async context => {
    const { locale = DEFAULT_LOCALE, req, res, query } = context;
    setNextLocaleCookie(locale, req, res);
    const translations = await serverSideTranslations(locale, [TranslationFiles.COMMON]);

    const auth = await getSession(req, res);
    const user = auth?.user as UserProfile;
    const loggingContext = await buildNextPageLoggingContext(context, '/', 'pages/index', 'getServerSideProps');

    if (user) {
        // Create a permissions object, strongly typed using the enum.
        const permissions = {
            [UserPermission.AllowReadCaseManagement]: await doesUserHavePagePermissions(
                context,
                UserPermission.AllowReadCaseManagement,
                loggingContext
            ),
            [UserPermission.AllowReadPolicyAdmin]: await doesUserHavePagePermissions(
                context,
                UserPermission.AllowReadPolicyAdmin,
                loggingContext
            ),
            [UserPermission.AllowReadOtpRenewals]: await doesUserHavePagePermissions(
                context,
                UserPermission.AllowReadOtpRenewals,
                loggingContext
            ),
        };

        let returnTo = locale + '/cases';

        if (!permissions[UserPermission.AllowReadCaseManagement] && permissions[UserPermission.AllowReadPolicyAdmin]) {
            returnTo = locale + '/policies';
        } else if (!permissions[UserPermission.AllowReadCaseManagement] && permissions[UserPermission.AllowReadOtpRenewals]) {
            returnTo = locale + '/create-case';
        }

        return {
            redirect: {
                destination: returnTo,
                permanent: false,
            },
        };
    }
    // if a connection query param is passed in, attempt to authenticate using it
    if (query?.connection) {
        return {
            redirect: {
                destination: `/api/auth/login?returnTo=${encodeURIComponent(`/?connection=${query?.connection}`)}`,
                permanent: false,
            },
        };
    }

    return {
        props: {
            ...translations,
            locale,
        },
    };
};

export default WelcomePage;
