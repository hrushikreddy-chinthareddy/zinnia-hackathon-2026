import { getAccessToken } from '@auth0/nextjs-auth0';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import CardInfo from '@deps/components/card/card-info/card-info';
import { TranslationFiles } from '@deps/config/translations';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { doesUserHavePagePermissions } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { UserPermission } from '@deps/models/user-profile';
import { ReactComponent as ErrorIcon } from '@deps/styles/elements/icons/icons_outlined/exclamation-alert.svg';
import { logWarn, parseErrorInformation, withPageAuthAndLogging } from '@deps/utils/server-logging';
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
    CLIENT_CODE_RETRIEVAL_ERROR: '24',
    DATA_ENTRY_UNASSIGN_TASK_ERROR: '25',
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
    [ERROR_CODES.NB_REG60_FORM_CREATION]: 'nbReg60FormCreation',
    [ERROR_CODES.NB_REG60_TASK_INITIALIZATION]: 'nbReg60TaskInitialization',
    [ERROR_CODES.SSW_FORM_CREATION]: 'sswFormCreation',
    [ERROR_CODES.SSW_TASK_INITIALIZATION]: 'sswTaskInitialization',
    [ERROR_CODES.NIGO_EXISTS]: 'nigoExists',
    [ERROR_CODES.RENEWAL_FORM_PLAN_CODE]: 'renewalFormPlanCode',
    [ERROR_CODES.DATA_ENTRY_START_TASK_ERROR]: 'dataEntryStartTaskError',
    [ERROR_CODES.DATA_ENTRY_UNASSIGN_TASK_ERROR]: 'dataEntryUnassignTaskError',
    [ERROR_CODES.POLICY_NOT_FOUND]: 'policyNotFound',
    [ERROR_CODES.TASK_INITIALIZATION]: 'taskInitialization',
    [ERROR_CODES.CASE_TYPE_RETRIEVAL_ERROR]: 'caseTypeRetrievalError',
    [ERROR_CODES.DOC_TYPE_RETRIEVAL_ERROR]: 'docTypeRetrievalError',
    [ERROR_CODES.CLIENT_CODE_RETRIEVAL_ERROR]: 'clientCodeRetrievalError',
};

export default function CreateCaseErrorPage() {
    const { t } = useTranslation(undefined, { keyPrefix: 'createCaseError' });
    const router = useRouter();
    const errorCode = router.query?.errorCode || 'default';
    const translationKey = ERROR_KEYS[errorCode as string] || ERROR_KEYS.default;

    return (
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
    { file: 'create-case/error', function: 'getServerSideProps', page: 'create-case/error' }
);
