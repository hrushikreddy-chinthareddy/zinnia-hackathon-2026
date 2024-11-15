import { Icon, IconType, BannerAlert, BannerVariant } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { TFunction, useTranslation } from 'next-i18next';
import { PropsWithChildren, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { getBadgeStatus, getBadgeStatusVariant } from '@deps/components/badge/badge.helper';
import Content, { ContentVariant } from '@deps/components/content/content';
import { FieldSize } from '@deps/components/fields/field';
import { getPolicyBadgeStatusTooltip } from '@deps/components/global-values/global-values-bar/global-values-helper';
import GlobalPolicyInfo from '@deps/components/global-values/policy-info/policy-info';
import IconButton from '@deps/components/icon-button/icon-button';
import Label, { LabelVariant } from '@deps/components/label/label';
import { PopoverPlacement } from '@deps/components/popover/popover';
import ResponsivePadding from '@deps/components/responsive-padding/responsive-padding';
import SelectSearch from '@deps/components/select-search/select-search';
import {
    AddressWithPending,
    EmailWithPending,
    PhoneWithPending,
} from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/non-financial-transactions.helper';
import PendingTag from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/pending-tag';
import { TranslationFiles } from '@deps/config/translations';
import { FormattedAddress, sortAddressesByType } from '@deps/containers/people-data-cards/address-card/address-card.helpers';
import QuickLinks, { QuickLinksProps } from '@deps/containers/quick-links/quick-links';
import SideSheetProductDetails from '@deps/containers/side-sheet-product-details/side-sheet-product-details';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { PolicyDetailsViewInfo, PolicyViewDetailsDto, toPolicyViewDetailsDto } from '@deps/data/policy-details-view';
import { fillColDefs } from '@deps/helpers/data-transform.helper';
import { getTotalMinRequiredAmount, policyDataToGlobalValues } from '@deps/helpers/global-values';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { BasePolicyComponentArgs, PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { convertKebabedDateString, formatDate, formatPhone, formatSSN, toTitleCase } from '@deps/helpers/string.helper';
import { mapAddressTypeToTranslation } from '@deps/helpers/translation.helper';
import { CardColumnsTest, CardDetailsTest } from '@deps/jest/constants/test-id-constants';
import {
    Address,
    Email,
    EmailType,
    Phone,
    PhoneType,
    Policy,
    PolicyFeatureFeatureType,
    PolicyStatus,
    ProductType,
} from '@deps/models/policy/sor-policy';
import { UserPermission } from '@deps/models/user-profile';
import { DashboardContext } from '@deps/pages/policies';
import { NonFinancialTransactionActions, NonFinancialTransactions } from '@deps/queries/api/bpm-non-financial';
import { DEFAULT_ERROR_STRING, DEFAULT_EXTENDED_DATE_FORMAT } from '@deps/types/constants';
import { SearchViewQuery } from '@deps/types/search';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import AnnuityQuickView from './active-quick-view/annuity';
import EverlyIul from './active-quick-view/everly-iul';
import EverlyUl from './active-quick-view/everly-ul';
import BaseDeathBenefit from './display-fields/base-death-benefit';
import UpcomingPremiumDisplayField from './display-fields/upcoming-premium';
import SideSheetAddress from '../people-data-cards/address-card/side-sheet/side-sheet-address';
import { sortEmailsByType } from '../people-data-cards/email-card/email-card.helpers';
import SideSheetEmail from '../people-data-cards/email-card/side-sheet/side-sheet-email';
import { sortPhonesByType } from '../people-data-cards/phone-card/phone-card.helpers';
import { SideSheetPhone } from '../people-data-cards/phone-card/side-sheet/side-sheet-phone';
import SideSheetPeopleHeader from '../people-data-cards/side-sheet-people-header/side-sheet-people-header';

interface SummaryCardProps extends PropsWithChildren {
    policy: Policy;
}

interface KeyValuesBarProps {
    policy: Policy;
}

// TODO MG: move these into different files
const quickLinks = (t: TFunction, policy: PolicyDetails): QuickLinksProps['links'] => {
    const { policyNumber, planCode } = policy;

    return [
        {
            href: t('site.navLinks.policyDetails.link', { id: policyNumber, planCode }),
            name: t(policy.isLife ? 'site.navLinks.policyDetails.altText' : 'site.navLinks.contractDetails.altText'),
        },
        {
            href: t('site.navLinks.people.link', { id: policyNumber, planCode }),
            name: t('site.navLinks.people.text'),
        },
        {
            href: t('site.navLinks.history.link', { id: policyNumber, planCode }),
            name: t('site.navLinks.history.text'),
        },
        {
            href: t('site.navLinks.documents.link', { id: policyNumber, planCode }),
            name: t('site.navLinks.documents.text'),
        },
    ];
};

const getPolicyHighlighter = ({ firstName, lastName, policyNumber, ssn }: SearchViewQuery) => {
    if (!firstName && !lastName && !policyNumber && !ssn) return [];

    const descriptionListHighlighter = [];

    if (firstName) {
        descriptionListHighlighter.push(firstName.trim());
    }
    if (lastName) {
        descriptionListHighlighter.push(lastName.trim());
    }
    if (ssn) {
        descriptionListHighlighter.push(`***-**-${ssn.slice(-4)}`);
    }
    if (policyNumber) {
        descriptionListHighlighter.push(policyNumber);
    }

    return descriptionListHighlighter;
};

const QuickViewHeader = ({ policy }: BasePolicyComponentArgs) => {
    const { t } = useTranslation([TranslationFiles.COMMON, TranslationFiles.COLDEFS]);
    const { searchValue } = useContext(DashboardContext);
    const perms = usePermissionsContext();

    const userPartyId = perms.getUserPartyId();
    const { carrierId, marketingName, planCode, planName, policyNumber, policyStatus, productType } = policy;
    const totalMinRequiredAmount = getTotalMinRequiredAmount(policy);
    const globalValuesData = useMemo(() => policyDataToGlobalValues(policy, t), [policy, t]);

    const sideSheet = useSideSheetContext();
    const openDetailsSidesheet = () => {
        sideSheet.changeSideSheetContent(
            <GlobalPolicyInfo tooltipPlacements={PopoverPlacement.BottomLeft} {...globalValuesData} />,
            <SideSheetProductDetails globalValues={globalValuesData} />
        );
        sideSheet.handleOpen(true);
    };

    const pendingLapse = policy.features.getFirstFeatureByType('LAPSEASSESSMENT' as PolicyFeatureFeatureType);
    const showPendingLapse = policyStatus === PolicyStatus.PENDINGLAPSE ? true : false;
    const tooltipDate =
        policyStatus === PolicyStatus.LAPSE || policyStatus === PolicyStatus.PENDINGLAPSE
            ? formatDate(pendingLapse?.endDate)
            : formatDate(policy?.issueDate);

    return (
        <header data-testid={CardDetailsTest.HEADER}>
            <div className="flex w-full items-end justify-between">
                <div className="w-full flex-wrap lg:flex lg:items-end lg:justify-between">
                    <GlobalPolicyInfo
                        carrierId={carrierId}
                        marketingName={marketingName}
                        planName={planName}
                        productType={productType}
                        policyNumber={policyNumber}
                        highlight={searchValue?.policyNumber}
                        status={t(getBadgeStatus(policyStatus))}
                        variant={getBadgeStatusVariant(policyStatus)}
                        tooltip={
                            t(getPolicyBadgeStatusTooltip(policyStatus), {
                                tooltipDate: tooltipDate,
                                tooltipAmount: showPendingLapse
                                    ? numberFormatify(pendingLapse?.totalMinimumRequiredAmount)
                                    : numberFormatify(totalMinRequiredAmount),
                            }) ?? ''
                        }
                        openSideSheet={openDetailsSidesheet}
                    />
                    <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4 lg:mt-0">
                        <QuickLinks
                            userPartyId={userPartyId}
                            policy={policy}
                            links={quickLinks(t, policy)}
                            planCode={planCode}
                            policyNumber={policyNumber}
                        />
                    </div>
                </div>
            </div>
            <hr className="my-4 h-0.5 border-none bg-gray-100" />
        </header>
    );
};

const KeyValuesBar: React.FC<KeyValuesBarProps> = ({ policy }) => {
    const { t } = useTranslation([TranslationFiles.COMMON, TranslationFiles.COLDEFS]);
    const perms = usePermissionsContext();
    const searchableDetailsDto = toPolicyViewDetailsDto(policy);
    const searchableDetailsData = fillColDefs<PolicyViewDetailsDto>(
        searchableDetailsDto,
        PolicyDetailsViewInfo(),
        t,
        'colDefs:policyDetails'
    );

    return (
        <div>
            <hr className="mb-4 h-0.5 border-none bg-gray-100 md:mb-6 lg:mb-4" />
            <div className="relative flex items-center">
                <SelectSearch
                    classNames="flex flex-col gap-1 max-w-[328px] w-full"
                    labelClassNames="mr-4 hidden md:block"
                    size={FieldSize.Small}
                    label={t('dashboard.quickSearch.label') || ''}
                    placeHolder={t('dashboard.quickSearch.placeholder') || ''}
                    values={searchableDetailsData}
                    errorMessageLink={`/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/policy-details`}
                    group={true}
                    dropUp
                    userPartyId={perms.getUserPartyId()}
                />
            </div>
        </div>
    );
};

interface QuickViewProp extends PropsWithChildren {
    children: ReactNode;
    gridColumns?: number;
    title: string;
}

const columnNumberAtLarge: Record<number, string> = {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
};

export const QuickViewRoot: React.FC<QuickViewProp> = ({ children, title, gridColumns = 2 }) => {
    return (
        <div
            data-testid={`${CardColumnsTest.ITEMS}-${title}`}
            className={`mt-8 grow first:mt-0 first:md:mt-0 lg:mt-0 lg:border-r-2 lg:border-r-gray-100 lg:px-8 lg:first:pl-0 lg:last:border-none lg:last:pr-0`}
        >
            <h3 className="pb-4">{title}</h3>
            <div
                className={`grid w-fit grid-cols-${gridColumns} items-start gap-x-8 gap-y-6 md:grid-cols-3 md:gap-y-6 ${columnNumberAtLarge[gridColumns]} lg:gap-y-8`}
            >
                {children}
            </div>
        </div>
    );
};

const PendingLapseQuickView = ({ policy }: BasePolicyComponentArgs) => {
    const { t } = useTranslation([TranslationFiles.COMMON, TranslationFiles.COLDEFS]);
    const pendingLapse = policy.features.getFirstFeatureByType('LAPSEASSESSMENT' as PolicyFeatureFeatureType);
    const { searchValue } = useContext(DashboardContext);

    return (
        <QuickViewRoot title={t('dashboard.search.results.policySummaryCard.header2')}>
            <div>
                <Label
                    variant={LabelVariant.FieldLabel}
                    label={t('colDefs:policySummary.gracePeriod')}
                    tooltipTitle={t('colDefs:policySummary.gracePeriod')}
                    tooltipBody={t('colDefs:policySummary.gracePeriodTooltip')}
                />
                <Content
                    details={`${dayjs(pendingLapse?.startDate).format(DEFAULT_EXTENDED_DATE_FORMAT)} - ${dayjs(
                        pendingLapse?.endDate
                    ).format(DEFAULT_EXTENDED_DATE_FORMAT)}`}
                    variant={ContentVariant.BodySm}
                />
            </div>
            <div>
                <Label
                    variant={LabelVariant.FieldLabel}
                    label={t('colDefs:policySummary.gracePeriodMinPayment')}
                    tooltipTitle={t('colDefs:policySummary.gracePeriodMinPayment')}
                    tooltipBody={t('colDefs:policySummary.gracePeriodMinPaymentTooltip')}
                />
                <Content
                    details={numberFormatify(pendingLapse?.totalMinimumRequiredAmount || DEFAULT_ERROR_STRING)}
                    variant={ContentVariant.BodySm}
                    highlights={getPolicyHighlighter(searchValue)}
                />
            </div>
            <UpcomingPremiumDisplayField policy={policy} />
            <BaseDeathBenefit baseDeathBenefit={policy.baseDeathBenefit} />
        </QuickViewRoot>
    );
};

const LapseQuickView = ({ policy }: BasePolicyComponentArgs) => {
    const { t } = useTranslation([TranslationFiles.COMMON, TranslationFiles.COLDEFS]);

    const reinstatement = policy.features.getFirstFeatureByType('REINSTATEMENT' as PolicyFeatureFeatureType);
    const pendingLapse = policy.features.getFirstFeatureByType('LAPSEASSESSMENT' as PolicyFeatureFeatureType);

    let reinstatementPeriodText;

    switch (Number(reinstatement?.period)) {
        case 0:
            reinstatementPeriodText = 'None';
            break;
        case 1:
            reinstatementPeriodText = t('common:temporal.oneYear');
            break;
        default:
            reinstatementPeriodText = t('common:temporal.nYears', { n: reinstatement?.period });
            break;
    }

    return (
        <QuickViewRoot title={t('dashboard.search.results.policySummaryCard.header2')}>
            <div>
                <Label
                    variant={LabelVariant.FieldLabel}
                    label={t('colDefs:policySummary.lapseEffectiveDate')}
                    tooltipTitle={t('colDefs:policySummary.lapseEffectiveDate')}
                    tooltipBody={t('colDefs:policySummary.lapseEffectiveDateTooltip')}
                />
                <Content details={dayjs(pendingLapse?.endDate).format(DEFAULT_EXTENDED_DATE_FORMAT)} variant={ContentVariant.BodySm} />
            </div>
            <div>
                <Label
                    variant={LabelVariant.FieldLabel}
                    label={t('colDefs:policySummary.reinstatementPeriod')}
                    tooltipTitle={t('colDefs:policySummary.reinstatementPeriod')}
                    tooltipBody={t('colDefs:policySummary.reinstatementPeriodTooltip')}
                />
                <Content details={reinstatementPeriodText} variant={ContentVariant.BodySm} />
            </div>
            {reinstatement && (
                <>
                    {!!reinstatement.approvalDate && (
                        <div>
                            <Label
                                variant={LabelVariant.FieldLabel}
                                label={t('colDefs:policySummary.underwritingDecision')}
                                tooltipTitle={t('colDefs:policySummary.underwritingDecision')}
                                tooltipBody={t('colDefs:policySummary.underwritingDecisionTooltip')}
                            />
                            <Content
                                details={
                                    reinstatement?.approvalDate
                                        ? String(t('common:general.approved'))
                                        : String(t('common:general.unapproved'))
                                }
                                variant={ContentVariant.BodySm}
                            />
                        </div>
                    )}

                    {reinstatement.approvalDate && reinstatement.endDate && (
                        <div>
                            <Label
                                variant={LabelVariant.FieldLabel}
                                label={t('colDefs:policySummary.reinstatementPaymentPeriod')}
                                tooltipTitle={t('colDefs:policySummary.reinstatementPaymentPeriod')}
                                tooltipBody={t('colDefs:policySummary.reinstatementPaymentPeriodTooltip')}
                            />
                            <Content
                                details={`${dayjs(reinstatement?.approvalDate).format(DEFAULT_EXTENDED_DATE_FORMAT)} - ${dayjs(
                                    reinstatement?.endDate
                                ).format(DEFAULT_EXTENDED_DATE_FORMAT)}`}
                                variant={ContentVariant.BodySm}
                            />
                        </div>
                    )}

                    {!!reinstatement.paymentAmount && (
                        <div>
                            <Label
                                variant={LabelVariant.FieldLabel}
                                label={t('colDefs:policySummary.reinstatementMinPayment')}
                                tooltipTitle={t('colDefs:policySummary.reinstatementMinPayment')}
                                tooltipBody={t('colDefs:policySummary.reinstatementMinPaymentTooltip')}
                            />
                            <Content details={numberFormatify(reinstatement?.paymentAmount)} variant={ContentVariant.BodySm} />
                        </div>
                    )}
                </>
            )}

            <BaseDeathBenefit baseDeathBenefit={policy.baseDeathBenefit} />
        </QuickViewRoot>
    );
};

const StatusBanner = ({ policy }: BasePolicyComponentArgs) => {
    const { t } = useTranslation();
    const policyStatus = policy.policyStatus;
    const { featureFlags } = useOptimizely();
    const freeLookEnabled = featureFlags[FEATURE_FLAGS.POLICY_FREE_LOOK_CANCELLATION];

    if (policyStatus === PolicyStatus.PENDINGLAPSE) {
        return (
            <BannerAlert
                variant={BannerVariant.Warning}
                cta={{
                    href: `/policies/${policy.planCode}/${policy.policyNumber}/policy/premiums/new-premium/`,
                    text: t('dashboard.search.results.policySummaryCard.pendingLapseBannerLink'),
                }}
                bodyText={t('dashboard.search.results.policySummaryCard.pendingLapseBannerText')}
            />
        );
    }
    if (policyStatus === PolicyStatus.LAPSE) {
        // TODO - BPB: Policy Features Helper Class
        const reinstatementWithApproval = policy.policy.policyFeatures?.find(
            pf => pf.featureType === ('REINSTATEMENT' as PolicyFeatureFeatureType) && pf.approvalDate
        );

        if (!reinstatementWithApproval) {
            return null;
        }

        return (
            <BannerAlert
                variant={BannerVariant.Error}
                cta={{
                    href: `/policies/${policy.planCode}/${policy.policyNumber}/policy/premiums/new-premium/`,
                    text: t('dashboard.search.results.policySummaryCard.lapseBannerLink'),
                }}
                bodyText={t('dashboard.search.results.policySummaryCard.lapseBannerText')}
            />
        );
    }

    if (freeLookEnabled && policy.freeLookPeriodDetails.isInFreeLookPeriod) {
        return (
            <BannerAlert
                variant={BannerVariant.Warning}
                bodyText={`${t('dashboard.search.results.policySummaryCard.freeLookCancelBannerText')} ${convertKebabedDateString(
                    policy.freeLookPeriodDetails?.endDate
                )}`}
                cta={{
                    href: `/policies/${policy.planCode}/${policy.policyNumber}/policy/freelook/cancel-freelook/`,
                    text: t('dashboard.search.results.policySummaryCard.freeLookCancelBannerLink'),
                }}
            />
        );
    }

    return null;
};

const QuickViewModule = ({ policy }: BasePolicyComponentArgs) => {
    if (policy.isLife) {
        switch (policy.policyStatus) {
            case PolicyStatus.PENDINGLAPSE:
                return <PendingLapseQuickView policy={policy} />;
            case PolicyStatus.LAPSE:
                return <LapseQuickView policy={policy} />;
            default:
                return <ActiveQuickView policy={policy} />;
        }
    }
    return <AnnuityQuickView policy={policy} />;
};

enum SideSheetViews {
    PHONE = 'PHONE',
    EMAIL = 'EMAIL',
    ADDRESS = 'ADDRESS',
}

const OwnerInformation = ({ policy }: BasePolicyComponentArgs) => {
    const { t } = useTranslation([TranslationFiles.COMMON, TranslationFiles.COLDEFS]);
    const { searchValue } = useContext(DashboardContext);
    const { owner } = policy;

    const perms = usePermissionsContext();
    const [canEditPolicy, setCanEditPolicy] = useState(false);
    const sideSheet = useSideSheetContext();

    useEffect(() => {
        const getCanEditPolicy = async () => {
            if (policy) {
                const flag = await perms.canEditPolicy(UserPermission.AllowEditPolicy, policy.planCode, policy.policyNumber);
                setCanEditPolicy(flag);
            }
        };
        getCanEditPolicy();
    }, [perms, policy]);

    const emails = owner?.bestAvailableEmail ? [owner?.bestAvailableEmail] : undefined;
    const emailTypeKey = owner?.bestAvailableEmail?.emailType?.toLocaleLowerCase() ?? EmailType.PERSONAL.toLocaleLowerCase();
    const [currentEmails, setCurrentEmails] = useState<Email[]>(sortEmailsByType({ emails }));
    const bestAvailEmail = currentEmails[0] as EmailWithPending;

    const phoneTypeKey = owner?.bestAvailablePhone?.phoneType?.toLocaleLowerCase() || PhoneType.HOME;
    const phones = owner?.bestAvailablePhone ? [owner?.bestAvailablePhone] : undefined;
    const [currentPhones, setCurrentPhones] = useState<Phone[]>(sortPhonesByType({ phones }));
    const bestAvailPhone = currentPhones[0] as PhoneWithPending;
    const contactNumberLabel = bestAvailPhone
        ? t(`people.card.phone.phoneOptions.${bestAvailPhone.phoneType?.toLocaleLowerCase()}`)
        : t('colDefs:owner.primaryPhone');

    const addressType = owner?.bestAvailableAddress?.addressType;
    const addresses = owner?.bestAvailableAddress ? [owner?.bestAvailableAddress] : undefined;
    const preferredAddressIndicator = owner?.preferredAddress?.addressId;
    const [currentAddresses, setCurrentAddresses] = useState<Address[]>(sortAddressesByType({ addresses, preferredAddressIndicator }));
    const bestAvailAddresss = currentAddresses[0] as AddressWithPending;

    const sideSheetContent = (type: SideSheetViews) => {
        const action = NonFinancialTransactionActions.Edit;
        let content;
        let header;
        switch (type) {
            case SideSheetViews.EMAIL:
                header = (
                    <SideSheetPeopleHeader
                        action={action}
                        transaction={NonFinancialTransactions.Email}
                        typeTranslation={t(`people.card.email.emailOptions.${emailTypeKey}`) as string}
                    />
                );
                content = (
                    <SideSheetEmail
                        isOnlyEmail={currentEmails.length === 1}
                        onCancel={() => sideSheet.handleOpen(false)}
                        party={owner?.party}
                        planCode={policy.planCode}
                        policyNumber={policy.policyNumber}
                        setCurrentEmails={setCurrentEmails}
                        updateEmail={bestAvailEmail}
                    />
                );
                break;
            case SideSheetViews.PHONE:
                header = (
                    <SideSheetPeopleHeader
                        action={action}
                        transaction={NonFinancialTransactions.Number}
                        typeTranslation={t(`people.card.phone.phoneOptions.${phoneTypeKey}`) as string}
                    />
                );
                content = (
                    <SideSheetPhone
                        onCancel={() => sideSheet.handleOpen(false)}
                        party={owner?.party}
                        planCode={policy.planCode}
                        policyNumber={policy.policyNumber}
                        setCurrentPhones={setCurrentPhones}
                        updatePhone={bestAvailPhone}
                    />
                );
                break;
            case SideSheetViews.ADDRESS:
                header = (
                    <SideSheetPeopleHeader
                        action={action}
                        transaction={NonFinancialTransactions.Address}
                        typeTranslation={t(mapAddressTypeToTranslation({ addressType, t })) as string}
                    />
                );
                content = (
                    <SideSheetAddress
                        isCurrentMailingAddress={preferredAddressIndicator === bestAvailAddresss.addressId}
                        isOnlyAddress={currentAddresses?.length === 1}
                        onCancel={() => sideSheet.handleOpen(false)}
                        party={owner?.party}
                        planCode={policy.planCode}
                        policyNumber={policy.policyNumber}
                        setCurrentAddresses={setCurrentAddresses}
                        updateAddress={bestAvailAddresss ?? undefined}
                    />
                );
        }
        return { header, content };
    };

    const openSideSheet = (type: SideSheetViews) => {
        const { header, content } = sideSheetContent(type);
        sideSheet.changeSideSheetContent(header, content);
        sideSheet.handleOpen(true);
    };

    return (
        <QuickViewRoot title={t('dashboard.search.results.policySummaryCard.header1')} gridColumns={1}>
            <div className="grid grid-cols-2 gap-10 md:grid-cols-1 lg:grid-cols-2">
                <div>
                    <Label variant={LabelVariant.FieldLabel} label={t('colDefs:owner.fullName')} />
                    <Content
                        details={toTitleCase(owner?.fullName) || DEFAULT_ERROR_STRING}
                        variant={ContentVariant.BodySm}
                        highlights={getPolicyHighlighter(searchValue)}
                        pii={true}
                    />
                </div>
                <div>
                    <div className="flex gap-1">
                        <Label id="policy-owner-email" variant={LabelVariant.FieldLabel} label={t('colDefs:owner.email')} />
                        {bestAvailEmail?.isPending && <PendingTag />}
                        {canEditPolicy && bestAvailEmail && (
                            <IconButton aria-describedby="policy-owner-email" onClick={() => openSideSheet(SideSheetViews.EMAIL)}>
                                <Icon type={IconType.EDIT_ALT} height={16} width={16} />
                            </IconButton>
                        )}
                    </div>
                    <Content details={bestAvailEmail?.emailAddress || DEFAULT_ERROR_STRING} variant={ContentVariant.BodySm} pii={true} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-10 md:grid-cols-1 lg:grid-cols-2">
                <div>
                    <Label variant={LabelVariant.FieldLabel} label={t('colDefs:owner.birthDate')} />
                    <Content details={owner?.formattedBirthDate} variant={ContentVariant.BodySm} pii={true} />
                </div>
                <div>
                    <div className="flex gap-1">
                        <Label id="policy-owner-phone" variant={LabelVariant.FieldLabel} label={contactNumberLabel} />
                        {bestAvailPhone?.isPending && <PendingTag />}
                        {canEditPolicy && bestAvailPhone && (
                            <IconButton aria-describedby="policy-owner-phone" onClick={() => openSideSheet(SideSheetViews.PHONE)}>
                                <Icon type={IconType.EDIT_ALT} height={16} width={16} />
                            </IconButton>
                        )}
                    </div>
                    <Content
                        details={(bestAvailPhone && formatPhone(bestAvailPhone)) || DEFAULT_ERROR_STRING}
                        variant={ContentVariant.BodySm}
                        pii={true}
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-10 md:grid-cols-1 lg:grid-cols-2">
                <div>
                    <Label variant={LabelVariant.FieldLabel} label={t('colDefs:owner.ssn')} />
                    <Content
                        details={formatSSN(owner?.ssn)}
                        variant={ContentVariant.BodySm}
                        highlights={getPolicyHighlighter(searchValue)}
                        pii={true}
                    />
                </div>
                <div>
                    <div className="flex gap-1">
                        <Label id="policy-owner-address" variant={LabelVariant.FieldLabel} label={t('colDefs:owner.mailingAddress')} />
                        {bestAvailAddresss?.isPending && <PendingTag />}
                        {canEditPolicy && bestAvailAddresss && (
                            <IconButton aria-describedby="policy-owner-address" onClick={() => openSideSheet(SideSheetViews.ADDRESS)}>
                                <Icon type={IconType.EDIT_ALT} height={16} width={16} />
                            </IconButton>
                        )}
                    </div>
                    {(bestAvailAddresss && <FormattedAddress address={bestAvailAddresss} />) || DEFAULT_ERROR_STRING}
                </div>
            </div>
        </QuickViewRoot>
    );
};

const ActiveQuickView = ({ policy }: BasePolicyComponentArgs) => {
    const { t } = useTranslation();

    return (
        <QuickViewRoot title={t('dashboard.search.results.policySummaryCard.header2')}>
            {policy?.product?.productType === ProductType.INDEXEDUNIVERSALLIFE ? (
                <EverlyIul policy={policy} />
            ) : (
                <EverlyUl policy={policy} />
            )}
        </QuickViewRoot>
    );
};

export const PolicyQuickView: React.FC<SummaryCardProps> = ({ policy }) => {
    const policyDetails = new PolicyDetails(policy);

    return (
        <section data-testid={CardDetailsTest.CARD} className="mb-4 min-h-[390px] min-w-[275px] rounded bg-white !p-0 shadow-sm">
            <ResponsivePadding>
                <QuickViewHeader policy={policyDetails} />
                <div data-testid={CardDetailsTest.CONTENT}>
                    <StatusBanner policy={policyDetails} />
                    <div data-testid={CardColumnsTest.COLUMNS} className="my-4 md:my-6 lg:my-8 lg:flex">
                        <OwnerInformation policy={policyDetails} />
                        <QuickViewModule policy={policyDetails} />
                    </div>
                </div>
                <KeyValuesBar policy={policy} />
            </ResponsivePadding>
        </section>
    );
};
