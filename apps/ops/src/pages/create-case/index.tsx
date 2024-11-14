import { getAccessToken, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { TabGroup, TabList, TabTrigger, TabContent, Icon, IconType } from '@zinnia/bloom/components';
import { getCookie, setCookie } from 'cookies-next';
import { GetServerSidePropsContext } from 'next';
import router from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useState } from 'react';
import xss from 'xss';

import Button, { ButtonSize, ButtonType } from '@deps/components/button/button';
import { CaseListContainer } from '@deps/components/case-list/components/case-list-container';
import CreateCaseForm from '@deps/components/create-case-form/create-case-form';
import { SearchKeys } from '@deps/components/create-case-form/create-case-form.helper';
import Field, { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import { Loading } from '@deps/components/loading';
import NoNavLayout from '@deps/components/no-nav-layout';
import NotificationMessage from '@deps/components/notification-message/notification-message';
import SelectSimple from '@deps/components/select/select';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import TaskManagementQueueContainer from '@deps/containers/task-management-queue/task-management-queue-container';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { isLocalStorageEnabled } from '@deps/helpers/local-storage.hepler';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { toTitleCase } from '@deps/helpers/string.helper';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { CaseType } from '@deps/models/case/case';
import { DocumentData } from '@deps/models/case/document';
import { docTypes } from '@deps/models/case/helpers';
import { UserPermission } from '@deps/models/user-profile';
import createCaseFromDocumentNumber from '@deps/operations/cases/caseOperations';
import { fetchDocument } from '@deps/operations/documents/documentOperations';
import { ReactComponent as ProgressIcon } from '@deps/styles/elements/icons/illustrations/check-progress.svg';
import { SegmentPageName, SegmentTrackedPageProps } from '@deps/types/segment-analytics';
import { getCarrierNameByClientId } from '@deps/utils/carriers';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { logWarn, parseErrorInformation } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

interface CaseCreatePageProps extends SegmentTrackedPageProps {
    featureFlagDecisions: FeatureFlags;
};

const RENEWAL_SUCCESS = 'otp-renewal-success';
const WITHDRAWAL_SUCCESS = 'otp-withdrawal-success';
const SYSTEMATIC_WITHDRAWAL_SUCCESS = 'otp-systematic-withdrawal-success';
const RMD_SUCCESS = 'otp-rmd-success';
const OFT_SUCCESS = 'otp-oft-success';
const OTP_FORM_CLIENT_COOKIE = 'otp-form-client-cookie';
const OTP_FORM_TYPE_COOKIE = 'otp-form-type-cookie';
const REG60_SUCCESS = 'reg60-massmutual-success';

const shouldShowCaseTaskList = (featureFlagDecisions: FeatureFlags, caseType: CaseType) => {
    return (
        (featureFlagDecisions?.[FEATURE_FLAGS.REG_60] && caseType == CaseType.Reg60) ||
        (featureFlagDecisions?.[FEATURE_FLAGS.SSW_SBGC] && caseType == CaseType.SSW) ||
        (caseType == CaseType.Withdrawal) ||
        (caseType == CaseType.Oft)
    );
};

export enum TabOptions {
    myTasks = 'My Tasks',
    search = 'Search',
};

const CaseCreate = ({ featureFlagDecisions, user }: CaseCreatePageProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const [showLoader, setShowLoader] = useState(false);
    const [activeTab, setActiveTab] = useState(TabOptions.search);

    useSegmentPageTracker(user, SegmentPageName.CreateCaseLanding);

    // TODO MG: call `useSegmentPageTracker()` when tab is changed?
    const handleTabChange = (value: string) => setActiveTab(value as TabOptions);

    const handleRouteChange = () => {
        setShowLoader(true);
    };
    const handleRouteComplete = () => {
        setShowLoader(false);
        router.events.off('routeChangeStart', handleRouteChange);
        router.events.off('routeChangeComplete', handleRouteComplete);
    };
    router.events.on('routeChangeStart', handleRouteChange);
    router.events.on('routeChangeComplete', handleRouteComplete);
    const permissions = usePermissionsContext();
    const [caseType, setCaseType] = useState<CaseType>(CaseType.Renewal);
    const [clientId, setClientId] = useState<string>('');
    const [clientIds, setClientIds] = useState([] as string[]);
    const [documentNumber, setDocumentNumber] = useState<string>('');
    const [policyNumber, setPolicyNumber] = useState<string>('');
    const [document, setDocument] = useState<DocumentData | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined);
    const shouldShowNewExperience = featureFlagDecisions?.[FEATURE_FLAGS.NEW_EXP];
    const shouldShowReg60Case = featureFlagDecisions?.[FEATURE_FLAGS.REG_60];
    const [searchByOption, setSearchByOption] = useState(SearchKeys.DocumentNumber);

    useEffect(() => {
        const fetchPermittedClientIds = async () => {
            const permittedClientIds = await permissions.getClientIds(UserPermission.AllowReadOtpRenewals);
            setClientIds(permittedClientIds);
        };
        fetchPermittedClientIds();
    }, [permissions]);

    useEffect(() => {
        const cookieClientId = getCookie(OTP_FORM_CLIENT_COOKIE);

        if (cookieClientId && clientIds.includes(cookieClientId as string)) {
            setClientId(cookieClientId as string);
        } else if (clientIds.length === 1 || (!clientIds.includes(clientId) && clientIds.length > 1)) {
            setClientId(clientIds[0]);
        } else {
            setClientId('');
        }
    }, [clientIds]);

    useEffect(() => {
        if (getCookie(OTP_FORM_TYPE_COOKIE)) {
            setCaseType(getCookie(OTP_FORM_TYPE_COOKIE) as CaseType);
        }
        if (!isLocalStorageEnabled()) {
            return;
        }

        // Renewal success message
        const successItem = localStorage.getItem(RENEWAL_SUCCESS);

        //REg60 success message
        const reg60Success = localStorage.getItem(REG60_SUCCESS);

        if (reg60Success) {
            setSuccessMessage(reg60Success);
            localStorage.removeItem(REG60_SUCCESS);
        }
        if (successItem) {
            setSuccessMessage(successItem);
            localStorage.removeItem(RENEWAL_SUCCESS);
        }

        // Withdrawal success message
        const WithdrawalSuccess = localStorage.getItem(WITHDRAWAL_SUCCESS);

        if (WithdrawalSuccess) {
            setSuccessMessage(WithdrawalSuccess);
            localStorage.removeItem(WITHDRAWAL_SUCCESS);
        }

        // RMD success message
        const RmdSuccess = localStorage.getItem(RMD_SUCCESS);

        if (RmdSuccess) {
            setSuccessMessage(RmdSuccess);
            localStorage.removeItem(RMD_SUCCESS);
        }

        // OFT success message
        const OftSuccess = localStorage.getItem(OFT_SUCCESS);

        if (OftSuccess) {
            setSuccessMessage(OftSuccess);
            localStorage.removeItem(OFT_SUCCESS);
        }

        const sswSuccess = localStorage.getItem(SYSTEMATIC_WITHDRAWAL_SUCCESS);

        if (sswSuccess) {
            setSuccessMessage(sswSuccess);
            localStorage.removeItem(SYSTEMATIC_WITHDRAWAL_SUCCESS);
        }
    }, []);

    async function createCase(): Promise<void> {
        setCookie(OTP_FORM_CLIENT_COOKIE, clientId, { maxAge: 1000 * 60 * 60 * 12 }); // 12hrs
        setCookie(OTP_FORM_TYPE_COOKIE, caseType, { maxAge: 1000 * 60 * 60 * 12 });
        setErrorMessage('');

        const docType = docTypes[caseType];
        setShowLoader(true);

        if (docType === docTypes[CaseType.AddressChange] || docType ===docTypes[CaseType.ReReg]) {
            await handleSearch();
            return;
        }

        // get onBase case document
        const documentResult = await fetchDocument(documentNumber, docType, clientId);
        if (!documentResult.success) {
            console.error('createDocument:: No documentNumber from getDocument', { documentNumber, docType, clientId });
            setErrorMessage(
                t(
                    clientIds.length < 2
                        ? 'caseRenewal.caseCreate.invalidDocumentError'
                        : 'caseRenewal.caseCreate.invalidDocumentOrClientId'
                ) as string
            );
            setShowLoader(false);

            return;
        }
        const document = documentResult.value;
        setPolicyNumber(document.contract);
        setDocument(document);

        if ((shouldShowNewExperience && caseType !== CaseType.Renewal) || caseType === CaseType.Reg60) {
            setShowLoader(false);
            setPolicyNumber(document.contract);
        } else {
            setPolicyNumber('');
            const caseResult = await createCaseFromDocumentNumber(
                document.documentNumber,
                document.caseId,
                document.contract,
                caseType,
                clientId
            );

            if (!caseResult.success) {
                console.error('createDocument:: No case id from createCase', {
                    documentNumber: document.documentNumber,
                    caseType,
                    clientId,
                });
                setErrorMessage(t('caseRenewal.caseCreate.createError', { documentNumber: document.documentNumber }) as string);
                setShowLoader(false);
                return;
            }
            const caseData = caseResult.value;
            const route = `${caseType.toLowerCase()}/${caseData.id}`;
            router.push(`/create-case/${route}?doc=${document.documentNumber}&clientId=${clientId}`);
        }
    }

    const onCaseTypeChange = (value: CaseType) => {
        setCaseType(value);
        setDocumentNumber('');
        setPolicyNumber('');
    };

    const onClientChange = (value: string) => {
        setClientId(value);
        setDocumentNumber('');
        setPolicyNumber('');
    };

    async function handleSearch(): Promise<void> {
        if (!documentNumber && !policyNumber) {
            setShowLoader(false);
            setErrorMessage(t('caseRenewal.caseCreate.documentOrPolicyNumberIsRequired') as string);
            return;
        }

        if (documentNumber) {
            const docType = docTypes[caseType];
            const documentResult = await fetchDocument(documentNumber, docType, clientId);
            if (!documentResult.success) {
                console.error('handleSearch:: No documentNumber from getDocument', { documentNumber, docType, clientId });
                setErrorMessage(
                    t(
                        clientIds.length < 2
                            ? 'caseRenewal.caseCreate.invalidDocumentError'
                            : 'caseRenewal.caseCreate.invalidDocumentOrClientId'
                    ) as string
                );
                setShowLoader(false);

                return;
            }
            const document = documentResult.value;
            if (caseType === CaseType.AddressChange) {
                router.push(`/address-change?policyNumber=${document.contract}&clientId=${clientId}&doc=${documentNumber}`);
            }
            if (caseType === CaseType.ReReg) {
                router.push(`/re-reg?policyNumber=${document.contract}&clientId=${clientId}&doc=${documentNumber}`);
            }
        } else if (policyNumber){
            if (caseType === CaseType.AddressChange) {
                router.push(`/address-change?policyNumber=${policyNumber}&clientId=${clientId}`);
            }
            if (caseType === CaseType.ReReg) {
                router.push(`/re-reg?policyNumber=${policyNumber}&clientId=${clientId}`);
            }
        }
    }

    const renderTabContent = (
        <>
            <TabContent className="flex w-full flex-col" value={TabOptions.myTasks}>
                <TaskManagementQueueContainer featureFlagDecisions={featureFlagDecisions} />
            </TabContent>
            <TabContent className="flex w-full flex-col" value={TabOptions.search}>
                <div className="my-5">
                    {successMessage && successMessage.length > 0 && (
                        <NotificationMessage message={successMessage} onClose={() => setSuccessMessage('')} />
                    )}
                </div>
                <CreateCaseForm
                    caseType={caseType}
                    onCaseTypeChange={onCaseTypeChange}
                    clientId={clientId}
                    clientIds={clientIds}
                    documentNumber={documentNumber}
                    setDocumentNumber={setDocumentNumber}
                    policyNumber={policyNumber}
                    setPolicyNumber={setPolicyNumber}
                    onClientChange={onClientChange}
                    createCase={createCase}
                    errorMessage={errorMessage}
                    shouldShowReg60Case={shouldShowReg60Case}
                    searchByOption={searchByOption}
                    setSearchByOption={setSearchByOption}
                />
                {shouldShowCaseTaskList(featureFlagDecisions, caseType) || shouldShowNewExperience ? (
                    <CaseListContainer
                        t={t}
                        policyNumber={policyNumber}
                        caseType={caseType}
                        clientId={clientId}
                        document={document}
                        setShowLoader={setShowLoader}
                        setErrorMessage={setErrorMessage}
                        setPolicyNumber={setPolicyNumber}
                    ></CaseListContainer>
                ) : null}
            </TabContent>
        </>
    );

    return (
        <NoNavLayout fullHeight={true}>
            {showLoader && <Loading />}
            <div className="flex flex-col">
                {!shouldShowNewExperience ? (
                    <div className="mb-4 w-[500px] self-center rounded bg-white shadow-sm">
                        <div className="flex flex-col border-b p-4">
                            <Typography variant={TypographyVariant.H1} className="self-center font-primary text-xl font-light">
                                {t('caseRenewal.caseCreate.createCase')}
                            </Typography>
                        </div>
                        <div className="flex flex-col p-4">
                            <div>
                                {successMessage && successMessage.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-center text-semantic-success">{successMessage}</p>
                                    </div>
                                )}
                                <SelectSimple
                                    label={t('caseRenewal.caseCreate.caseType') as string}
                                    onChange={value => setCaseType(value as CaseType)}
                                    options={[
                                        ...(shouldShowReg60Case
                                            ? [{ label: t('caseRenewal.caseCreate.reg60'), value: CaseType.Reg60 }]
                                            : []),
                                        { label: t('caseRenewal.caseCreate.oft'), value: CaseType.Oft },
                                        { label: t('caseRenewal.caseCreate.renewal'), value: CaseType.Renewal },
                                        { label: t('caseRenewal.caseCreate.rmd'), value: CaseType.Rmd },
                                        { label: t('caseRenewal.caseCreate.withdrawal'), value: CaseType.Withdrawal },
                                        { label: t('caseRenewal.caseCreate.ssw'), value: CaseType.SSW },
                                    ]}
                                    placeholder={t('caseRenewal.caseCreate.caseTypePlaceholder') as string}
                                    size={FieldSize.Small}
                                    value={caseType}
                                />
                            </div>
                            <div className="mt-4">
                                <SelectSimple
                                    disabled={clientIds.length < 2}
                                    onChange={setClientId}
                                    label={t('caseRenewal.caseCreate.client') as string}
                                    options={clientIds.map(cId => {
                                        return { label: `${getCarrierNameByClientId(cId) || cId}`, value: cId.toLowerCase() };
                                    })}
                                    placeholder={t('caseRenewal.caseCreate.selectAClient') as string}
                                    size={FieldSize.Small}
                                    value={clientId}
                                    variant={clientIds.length < 2 ? FieldVariant.Inactive : FieldVariant.Default}
                                />
                            </div>
                            <div className="mt-4">
                                <Field
                                    label={t('caseRenewal.caseCreate.documentId') as string}
                                    onChange={event => setDocumentNumber(xss(event.target.value))}
                                    placeholder={t('caseRenewal.caseCreate.documentIdPlaceholder') as string}
                                    size={FieldSize.Small}
                                    type={FieldType.BaseActive}
                                    value={documentNumber}
                                />
                            </div>
                            {errorMessage && (
                                <div className="mt-4 flex flex-col">
                                    <p className="self-center text-semantic-error">{errorMessage}</p>
                                </div>
                            )}
                            <div className="mt-4 self-center">
                                <Button
                                    aria-label={t('caseRenewal.caseCreate.createAriaLabel') as string}
                                    onClick={createCase}
                                    size={ButtonSize.Small}
                                    type={ButtonType.Primary}
                                >
                                    {t('caseRenewal.caseCreate.create')}
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <TabGroup defaultValue={activeTab} value={activeTab} activationMode="manual" onValueChange={handleTabChange}>
                            <TabList className="!mb-0 w-full px-4 pt-4">
                                <TabTrigger value={TabOptions.myTasks}>
                                    <ProgressIcon width={24} height={24} className="hidden lg:block" />{' '}
                                    {toTitleCase(t('caseRenewal.caseCreate.tabs.myTask') ?? '')}
                                </TabTrigger>
                                <TabTrigger value={TabOptions.search}>
                                    <Icon width={24} height={24} className="hidden lg:block" type={IconType.DOCUMENT_TEXT} />{' '}
                                    {toTitleCase(t('caseRenewal.caseCreate.tabs.search') ?? '')}
                                </TabTrigger>
                            </TabList>

                            {renderTabContent}
                        </TabGroup>
                    </>
                )}
            </div>
        </NoNavLayout>
    );
};

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: async (context: GetServerSidePropsContext) => {
        const user = await getUserData(context);
        const { locale = DEFAULT_LOCALE, res, req } = context;
        let accessToken;
        try {
            accessToken = (await getAccessToken(req, res)).accessToken;
        } catch (e) {
            logWarn('create-case/index:: Access token expired', {
                ...parseErrorInformation(e),
                file: 'create-case/index',
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

        const featureFlagDecisions = await optimizelyService.getFeatureFlagDecisions(user.sub);

        const translations = await serverSideTranslations(
            locale,
            [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
            nextI18nextConfig,
            ALL_LOCALES
        );
        return { props: { featureFlagDecisions, locale, ...translations, user } };
    },
});

export default CaseCreate;