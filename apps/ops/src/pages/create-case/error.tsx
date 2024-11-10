import { getAccessToken, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import CardInfo from '@deps/components/card/card-info/card-info';
import NoNavLayout from '@deps/components/no-nav-layout';
import { TranslationFiles } from '@deps/config/translations';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { UserPermission } from '@deps/models/user-profile';
import { ReactComponent as ErrorIcon } from '@deps/styles/elements/icons/icons_outlined/exclamation-alert.svg';
import { logWarn, parseErrorInformation } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

export const ERROR_CODES = {
    DOCUMENT_RETRIEVAL: '1',
    WITHDRAWAL_FORM_CREATION: '2',
    WITHDRAWAL_TASK_INITIALIZATION: '3',
    RENEWAL_FORM_CREATION: '4',
    RENEWAL_FORM_FUNDS_LIST: '5',
    RMD_FORM_CREATION: '6',
    RMD_TASK_INITIALIZATION: '7',
    OFT_FORM_CREATION: '8',
    OFT_TASK_INITIALIZATION: '9',
    NB_REG60_FORM_CREATION: '10',
    NB_REG60_TASK_INITIALIZATION: '11',
    SSW_FORM_CREATION: '12',
    SSW_TASK_INITIALIZATION: '13',
    NIGO_EXISTS: '14',
    RENEWAL_FORM_PLAN_CODE: '15',
    DATA_ENTRY_START_TASK_ERROR: '16',
    POLICY_NOT_FOUND: '17',
    TASK_INITIALIZATION: '18',
    CASE_TYPE_RETRIEVAL_ERROR: '19',
    DOC_TYPE_RETRIEVAL_ERROR: '20',
    PLAN_CODE_NOT_FOUND: '21',
    SUITABILITY_FORM_TASK_INITIALIZATION: '22',
    SUITABILITY_REVIEW_TASK_INITIALIZATION: '23',
};

// These keys map to the createCaseError.errorMessaging translations.
export const ERROR_KEYS: { [key: (typeof ERROR_CODES)[keyof typeof ERROR_CODES] | 'default']: string } = {
    default: 'default',
    [ERROR_CODES.DOCUMENT_RETRIEVAL]: 'documentRetrieval',
    [ERROR_CODES.RMD_FORM_CREATION]: 'rmdFormCreation',
    [ERROR_CODES.RMD_TASK_INITIALIZATION]: 'rmdTaskInitialization',
    [ERROR_CODES.WITHDRAWAL_FORM_CREATION]: 'withdrawalFormCreation',
    [ERROR_CODES.WITHDRAWAL_TASK_INITIALIZATION]: 'withdrawalTaskInitialization',
    [ERROR_CODES.RENEWAL_FORM_CREATION]: 'renewalFormCreation',
    [ERROR_CODES.RENEWAL_FORM_FUNDS_LIST]: 'renewalFormFundsList',
    [ERROR_CODES.OFT_FORM_CREATION]: 'oftFormCreation',
    [ERROR_CODES.OFT_TASK_INITIALIZATION]: 'oftTaskInitialization',
    [ERROR_CODES.NIGO_EXISTS]: 'nigoExists',
    [ERROR_CODES.RENEWAL_FORM_PLAN_CODE]: 'renewalFormPlanCode',
    [ERROR_CODES.DATA_ENTRY_START_TASK_ERROR]: 'dataEntryStartTaskError',
    [ERROR_CODES.POLICY_NOT_FOUND]: 'policyNotFound',
    [ERROR_CODES.TASK_INITIALIZATION]: 'taskInitialization',
    [ERROR_CODES.CASE_TYPE_RETRIEVAL_ERROR]: 'caseTypeRetrievalError',
    [ERROR_CODES.DOC_TYPE_RETRIEVAL_ERROR]: 'docTypeRetrievalError',
};

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

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: async (context: GetServerSidePropsContext) => {
        const user = await getUserData(context);
        const { locale = DEFAULT_LOCALE, req, res } = context;
        let accessToken;
        try {
            accessToken = (await getAccessToken(req, res)).accessToken;
        } catch (e) {
            logWarn('create-case/error:: Access token expired', {
                ...parseErrorInformation(e),
                file: 'create-case/error',
                function: 'getServerSideProps',
            });
            return serverSidePropsLogout();
        }
        const doesUserHasPagePermissions = await doesUserHavePagePermissions(accessToken, user, UserPermission.AllowReadOtpRenewals);
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
});
