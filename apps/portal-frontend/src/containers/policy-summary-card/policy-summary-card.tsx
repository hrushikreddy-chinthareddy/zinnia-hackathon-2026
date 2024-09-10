import dayjs from 'dayjs';
import { TFunction, useTranslation } from 'next-i18next';
import { PropsWithChildren, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { getBadgeStatus, getBadgeStatusVariant } from '@deps/components/badge/badge.helper';
import BannerAlert, { BannerVariant } from '@deps/components/banner-alert/banner-alert';
import Content, { ContentVariant } from '@deps/components/content/content';
import { FieldSize } from '@deps/components/fields/field';
import { getPolicyBadgeStatusTooltip } from '@deps/components/global-values/global-values-bar/global-values-helper';
import PolicyInfo from '@deps/components/global-values/policy-info/policy-info';
import GlobalPolicyInfo from '@deps/components/global-values/policy-info/policy-info';
import Label, { LabelVariant } from '@deps/components/label/label';
import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { PopoverPlacement } from '@deps/components/popover/popover';
import ResponsivePadding from '@deps/components/responsive-padding/responsive-padding';
import SelectSearch from '@deps/components/select-search/select-search';
import BankingDetails from '@deps/components/side-sheet/banking-details/banking-details';
import { TranslationFiles } from '@deps/config/translations';
import { FormattedAddress } from '@deps/containers/people-data-cards/address-card/address-card.helpers';
import QuickLinks, { QuickLinksProps } from '@deps/containers/quick-links/quick-links';
import SideSheetProductDetails from '@deps/containers/side-sheet-product-details/side-sheet-product-details';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { PolicyDetailsViewInfo, PolicyViewDetailsDto, toPolicyViewDetailsDto } from '@deps/data/policy-details-view';
import { PolicyOwnerDto, toPolicyOwnerDto } from '@deps/data/policy-owner';
import { toPolicySummaryColDto, IUpcomingPremium } from '@deps/data/policy-summary';
import { fillColDefs } from '@deps/helpers/data-transform.helper';
import { getTotalMinRequiredAmount, policyDataToGlobalValues } from '@deps/helpers/global-values';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { bestAvailableContactNumber } from '@deps/helpers/phone.helper';
import { formatAccountNumber, formatDate, formatPhone, formatSSN, toTitleCase } from '@deps/helpers/string.helper';
import { convertKebabedDateString } from '@deps/helpers/string.helper';
import { CardColumnsTest, CardDetailsTest } from '@deps/jest/constants/test-id-constants';
import { LineOfBusiness, PartyRole, Policy, PolicyFeatureFeatureType, PolicyStatus, Reason } from '@deps/models/policy/sor-policy';
import { DashboardContext } from '@deps/pages/policies';
import {
    TransactionResponseStatus,
    checkEligibilityOneTimePremium,
    checkEligibilityPartialWithdrawalOneTime,
    checkEligibilitySystematicPrograms,
} from '@deps/queries/api/bpm';
import { DEFAULT_ERROR_STRING, DEFAULT_EXTENDED_DATE_FORMAT } from '@deps/types/constants';
import { SearchViewQuery } from '@deps/types/search';

interface SummaryCardProps extends PropsWithChildren {
    policy: Policy;
}

interface PendingLapseQuickViewProps {
    policy: Policy;
}

interface LapseQuickViewProps {
    policy: Policy;
}

interface ActiveQuickViewProps {
    policy: Policy;
}

interface QuickViewHeaderProps {
    policy: Policy;
    eligibilityCheck?: [];
}

interface KeyValuesBarProps {
    policy: Policy;
}

const quickLinks = (t: TFunction, policyNumber: string | undefined, planCode: string | undefined): QuickLinksProps['links'] => [
    {
        href: t('site.navLinks.policyDetails.link', { id: policyNumber, planCode }),
        name: t('site.navLinks.policyDetails.altText'),
    },
    {
        href: t('site.navLinks.people.link', { id: policyNumber, planCode }),
        name: t('site.navLinks.people.text'),
    },
    {
        href: t('site.navLinks.transactions.link', { id: policyNumber, planCode }),
        name: t('site.navLinks.transactions.text'),
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

const QuickViewHeader: React.FC<QuickViewHeaderProps> = ({ policy }) => {
    const { t } = useTranslation([TranslationFiles.COMMON, TranslationFiles.COLDEFS]);
    const { searchValue } = useContext(DashboardContext);
    const { policyNumber, policyStatus, policyFeatures = [], product, policyDates } = policy;
    const { marketingName, planCode } = product ?? {};
    const totalMinRequiredAmount = getTotalMinRequiredAmount(policyFeatures);
    const productType = policy?.product?.productType;
    const globalValuesData = useMemo(() => policyDataToGlobalValues(policy, t), [policy, t]);

    const sideSheet = useSideSheetContext();
    const openDetailsSidesheet = () => {
        sideSheet.changeSideSheetContent(
            <GlobalPolicyInfo tooltipPlacements={PopoverPlacement.BottomLeft} {...globalValuesData} />,
            <SideSheetProductDetails globalValues={globalValuesData} />
        );
        sideSheet.handleOpen(true);
    };

    const pendingLapse = policyFeatures?.find(pf => pf.featureType === ('LAPSEASSESSMENT' as PolicyFeatureFeatureType));
    const showPendingLapse = policyStatus === PolicyStatus.PENDINGLAPSE ? true : false;
    const tooltipDate =
        policyStatus === PolicyStatus.LAPSE || policyStatus === PolicyStatus.PENDINGLAPSE
            ? formatDate(pendingLapse?.endDate)
            : formatDate(policyDates?.issueDate);

    const systematicProgram = policy.systematicPrograms?.find(sp => sp.reason === Reason.PREMIUM);
    const arrangementId = systematicProgram?.arrangementId || '';

    const [isEligibleManageAutopay, setIsEligibleManageAutopay] = useState(false);
    const [autopayChecked, setAutopayChecked] = useState(false);
    const [isEligibleNewPremium, setIsEligibleNewPremium] = useState(false);
    const [newPremiumChecked, setNewPremiumChecked] = useState(false);
    const [isEligibleWithdrawal, setIsEligibleWithdrawal] = useState(false);
    const [withdrawalChecked, setWithdrawalChecked] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [fireEligibilityChecks, setFireEligibilityChecks] = useState(false);

    const [isLife] = useState(policy.product?.lineOfBusiness === LineOfBusiness.LIFE);

    // this should only run once after fireEligibilityChecks && isLife are both true
    useEffect(() => {
        if (fireEligibilityChecks && isLife) {
            const checkManageAutopayEligibility = async () => {
                const manageAutopayEligibility = await checkEligibilitySystematicPrograms(planCode, policyNumber, arrangementId || '');

                if (manageAutopayEligibility?.status === TransactionResponseStatus.Success) {
                    setIsEligibleManageAutopay(true);
                }
                setAutopayChecked(true);
            };

            const checkOneTimeEligibility = async () => {
                const oneTimeEligibility = await checkEligibilityOneTimePremium(planCode, policyNumber);

                if (oneTimeEligibility?.status === TransactionResponseStatus.Success) {
                    setIsEligibleNewPremium(true);
                }
                setNewPremiumChecked(true);
            };

            const checkWithdrawalEligibility = async () => {
                const withdrawalEligibility = await checkEligibilityPartialWithdrawalOneTime(planCode, policyNumber);

                if (withdrawalEligibility?.status === TransactionResponseStatus.Success) {
                    setIsEligibleWithdrawal(true);
                }
                setWithdrawalChecked(true);
            };

            checkManageAutopayEligibility();
            checkOneTimeEligibility();
            checkWithdrawalEligibility();
        }
    }, [planCode, policyNumber, arrangementId, fireEligibilityChecks, isLife]);

    useEffect(() => {
        if (autopayChecked && newPremiumChecked && withdrawalChecked) {
            setIsLoading(false);
        }
    }, [autopayChecked, newPremiumChecked, withdrawalChecked]);

    const eligibilityCheck = {
        eligibleAutopay: isEligibleManageAutopay,
        eligiblePremium: isEligibleNewPremium,
        eligibleWithdrawal: isEligibleWithdrawal,
    };

    function onOpenChange(open: boolean) {
        if (open) {
            setFireEligibilityChecks(true);
        }
    }

    return (
        <header data-testid={CardDetailsTest.HEADER}>
            <div className="flex w-full items-end justify-between">
                <div className="w-full flex-wrap lg:flex lg:items-end lg:justify-between">
                    <PolicyInfo
                        carrierId={policy.carrierId}
                        marketingName={marketingName}
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
                            links={quickLinks(t, policyNumber, planCode)}
                            planCode={planCode}
                            policyNumber={policyNumber}
                            eligibilityCheck={eligibilityCheck}
                            isLoading={isLoading}
                            onOpenChange={(open: boolean) => onOpenChange(open)}
                            policy={policy}
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

const QuickViewRoot: React.FC<QuickViewProp> = ({ children, title, gridColumns = 2 }) => {
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

interface UpcomingPremiumProps {
    upcomingPremium: IUpcomingPremium;
}

const UpcomingPremium: React.FC<UpcomingPremiumProps> = ({ upcomingPremium }) => {
    const { t } = useTranslation([TranslationFiles.COMMON, TranslationFiles.COLDEFS]);
    const sideSheet = useSideSheetContext();
    const globalValuesData = useMemo(() => policyDataToGlobalValues(upcomingPremium?.policy, t), [upcomingPremium?.policy, t]);

    const amountAndDate = `${numberFormatify(upcomingPremium.amount || '')} - ${
        dayjs(upcomingPremium.paymentDate).format(DEFAULT_EXTENDED_DATE_FORMAT) || ''
    }`;

    let transactionLink;
    const openBankingSidesheet = () => {
        sideSheet.changeSideSheetContent(
            <PolicyInfo tooltipPlacements={PopoverPlacement.BottomLeft} {...globalValuesData} />,
            <BankingDetails bankDetails={upcomingPremium.bankAccount} />
        );
        sideSheet.handleOpen(true);
    };

    if (!upcomingPremium.bankAccount?.accountNumber) {
        transactionLink = (
            <NavElement
                size={NavElementSize.Small}
                type={NavElementType.Link}
                href={`/policies/${upcomingPremium?.policy?.product?.planCode}/${upcomingPremium?.policy?.policyNumber}/transactions/premiums/new-premium`}
            >
                {t('colDefs:policySummary.makePayment')}
            </NavElement>
        );
    } else {
        transactionLink = (
            <NavElement onClick={openBankingSidesheet} size={NavElementSize.Small} type={NavElementType.Button}>
                <PiiWrapper>
                    {t('colDefs:policySummary.endingIn', {
                        accountType: toTitleCase(upcomingPremium?.bankAccount.accountType),
                        accountNumber:
                            formatAccountNumber(
                                upcomingPremium?.bankAccount.internationalBankAccountNumber ?? upcomingPremium?.bankAccount.accountNumber,
                                true
                            ) ?? DEFAULT_ERROR_STRING,
                    })}
                </PiiWrapper>
            </NavElement>
        );
    }

    return (
        <>
            <Content details={amountAndDate} variant={ContentVariant.BodySm} />
            {transactionLink}
        </>
    );
};

const PendingLapseQuickView = ({ policy }: PendingLapseQuickViewProps) => {
    const { t } = useTranslation([TranslationFiles.COMMON, TranslationFiles.COLDEFS]);
    const { policyFeatures = [] } = policy;
    const pendingLapse = policyFeatures?.find(pf => pf.featureType === ('LAPSEASSESSMENT' as PolicyFeatureFeatureType));
    const policySummaryDto = toPolicySummaryColDto(policy);
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
            <div>
                <Label variant={LabelVariant.FieldLabel} label={t('colDefs:policySummary.upcomingMonthlyPremium')} />
                <UpcomingPremium upcomingPremium={policySummaryDto.upcomingPremium} />
            </div>
            <div>
                <Label
                    variant={LabelVariant.FieldLabel}
                    label={t('colDefs:policySummary.baseDeathBenefit')}
                    tooltipTitle={t('colDefs:policySummary.baseDeathBenefit')}
                    tooltipBody={t('colDefs:policySummary.baseDeathBenefitTooltip')}
                />
                <Content
                    details={numberFormatify(policySummaryDto.baseDeathBenefit || DEFAULT_ERROR_STRING)}
                    variant={ContentVariant.BodySm}
                    highlights={getPolicyHighlighter(searchValue)}
                />
            </div>
        </QuickViewRoot>
    );
};

const LapseQuickView = ({ policy }: LapseQuickViewProps) => {
    const { t } = useTranslation([TranslationFiles.COMMON, TranslationFiles.COLDEFS]);
    const { policyFeatures = [] } = policy;
    const reinstatement = policyFeatures?.find(pf => pf.featureType === ('REINSTATEMENT' as PolicyFeatureFeatureType));
    const pendingLapse = policyFeatures?.find(pf => pf.featureType === ('LAPSEASSESSMENT' as PolicyFeatureFeatureType));
    const policySummaryDto = toPolicySummaryColDto(policy);
    const { searchValue } = useContext(DashboardContext);

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

            <div>
                <Label
                    variant={LabelVariant.FieldLabel}
                    label={t('colDefs:policySummary.baseDeathBenefit')}
                    tooltipTitle={t('colDefs:policySummary.baseDeathBenefit')}
                    tooltipBody={t('colDefs:policySummary.baseDeathBenefitTooltip')}
                />
                <Content
                    details={numberFormatify(policySummaryDto.baseDeathBenefit || DEFAULT_ERROR_STRING)}
                    variant={ContentVariant.BodySm}
                    highlights={getPolicyHighlighter(searchValue)}
                />
            </div>
        </QuickViewRoot>
    );
};

const ActiveQuickView = ({ policy }: ActiveQuickViewProps) => {
    const { t } = useTranslation([TranslationFiles.COMMON, TranslationFiles.COLDEFS]);
    const policySummaryDto = toPolicySummaryColDto(policy);
    const { searchValue } = useContext(DashboardContext);

    return (
        <QuickViewRoot title={t('dashboard.search.results.policySummaryCard.header2')}>
            <div>
                <Label variant={LabelVariant.FieldLabel} label={t('colDefs:policySummary.upcomingMonthlyPremium')} />
                <UpcomingPremium upcomingPremium={policySummaryDto.upcomingPremium} />
            </div>
            <div>
                <Label
                    variant={LabelVariant.FieldLabel}
                    label={t('colDefs:policySummary.baseDeathBenefit')}
                    tooltipTitle={t('colDefs:policySummary.baseDeathBenefit')}
                    tooltipBody={t('colDefs:policySummary.baseDeathBenefitTooltip')}
                />
                <Content
                    details={numberFormatify(policySummaryDto.baseDeathBenefit || DEFAULT_ERROR_STRING)}
                    variant={ContentVariant.BodySm}
                    highlights={getPolicyHighlighter(searchValue)}
                />
            </div>
            <div>
                <Label variant={LabelVariant.FieldLabel} label={t('colDefs:policySummary.issueDate')} />
                <Content details={policySummaryDto.issueDate} variant={ContentVariant.BodySm} />
            </div>
            <div>
                <Label
                    variant={LabelVariant.FieldLabel}
                    label={t('colDefs:policySummary.accountValue')}
                    tooltipTitle={t('colDefs:policySummary.accountValue')}
                    tooltipBody={t('colDefs:policySummary.accountValueTooltip')}
                />
                <Content details={numberFormatify(policySummaryDto.accountValue || DEFAULT_ERROR_STRING)} variant={ContentVariant.BodySm} />
            </div>
            <div>
                <Label variant={LabelVariant.FieldLabel} label={t('colDefs:policySummary.maturityDate')} />
                <Content
                    details={convertKebabedDateString(policySummaryDto.maturityDate) || DEFAULT_ERROR_STRING}
                    variant={ContentVariant.BodySm}
                />
            </div>
            <div>
                <Label
                    variant={LabelVariant.FieldLabel}
                    label={t('colDefs:policySummary.surrenderValue')}
                    tooltipTitle={t('colDefs:policySummary.surrenderValue')}
                    tooltipBody={t('colDefs:policySummary.surrenderValueTooltip')}
                />
                <Content
                    details={numberFormatify(policySummaryDto.surrenderValue || DEFAULT_ERROR_STRING)}
                    variant={ContentVariant.BodySm}
                />
            </div>
        </QuickViewRoot>
    );
};

export const PolicyQuickView: React.FC<SummaryCardProps> = ({ policy }) => {
    const { t } = useTranslation([TranslationFiles.COMMON, TranslationFiles.COLDEFS]);
    const { searchValue } = useContext(DashboardContext);
    const { parties, partyRoles = [], policyFeatures, policyStatus, policyNumber, product } = policy;
    const planCode = product?.planCode;
    const owner = partyRoles?.find(pr => pr.partyRole === PartyRole.OWNER);
    const policyParty = parties?.find(party => party.partyId === owner?.partyId);
    const policyOwnerDto: PolicyOwnerDto = toPolicyOwnerDto(policyParty ?? {});

    const policyQuickView = () => {
        switch (policyStatus) {
            case PolicyStatus.PENDINGLAPSE:
                return <PendingLapseQuickView policy={policy} />;
            case PolicyStatus.LAPSE:
                return <LapseQuickView policy={policy} />;
            default:
                return <ActiveQuickView policy={policy} />;
        }
    };

    const statusBanner = () => {
        if (policyStatus === PolicyStatus.PENDINGLAPSE) {
            return (
                <BannerAlert
                    variant={BannerVariant.Warning}
                    cta={{
                        href: `/policies/${planCode}/${policyNumber}/transactions/premiums/new-premium/`,
                        text: t('dashboard.search.results.policySummaryCard.pendingLapseBannerLink'),
                    }}
                >
                    {t('dashboard.search.results.policySummaryCard.pendingLapseBannerText')}
                </BannerAlert>
            );
        }
        if (policyStatus === PolicyStatus.LAPSE) {
            const reinstatement = policyFeatures?.find(pf => pf.featureType === ('REINSTATEMENT' as PolicyFeatureFeatureType));

            return reinstatement?.approvalDate ? (
                <BannerAlert
                    variant={BannerVariant.Error}
                    cta={{
                        href: `/policies/${planCode}/${policyNumber}/transactions/premiums/new-premium/`,
                        text: t('dashboard.search.results.policySummaryCard.lapseBannerLink'),
                    }}
                >
                    {t('dashboard.search.results.policySummaryCard.lapseBannerText')}
                </BannerAlert>
            ) : null;
        }
        return null;
    };

    const bestAvailable = policyParty ? bestAvailableContactNumber({ party: policyParty }) : null;
    const contactNumber = bestAvailable ? bestAvailable.contactNumber : null;
    const contactNumberLabel = contactNumber
        ? t(`people.card.phone.phoneOptions.${contactNumber.phoneType?.toLocaleLowerCase()}`)
        : t('colDefs:owner.primaryPhone');

    return (
        <section data-testid={CardDetailsTest.CARD} className="mb-4 min-h-[390px] min-w-[275px] rounded bg-white !p-0 shadow-sm">
            <ResponsivePadding>
                <QuickViewHeader policy={policy} />
                <div data-testid={CardDetailsTest.CONTENT}>
                    {statusBanner()}
                    <div data-testid={CardColumnsTest.COLUMNS} className="my-4 md:my-6 lg:my-8 lg:flex">
                        <QuickViewRoot title={t('dashboard.search.results.policySummaryCard.header1')} gridColumns={1}>
                            <div className="grid grid-cols-2 gap-10 md:grid-cols-1 lg:grid-cols-2">
                                <div>
                                    <Label variant={LabelVariant.FieldLabel} label={t('colDefs:owner.fullName')} />
                                    <Content
                                        details={toTitleCase(policyOwnerDto.fullName)}
                                        variant={ContentVariant.BodySm}
                                        highlights={getPolicyHighlighter(searchValue)}
                                        pii={true}
                                    />
                                </div>
                                <div>
                                    <Label variant={LabelVariant.FieldLabel} label={t('colDefs:owner.email')} />
                                    <Content
                                        details={policyOwnerDto.email?.emailAddress || DEFAULT_ERROR_STRING}
                                        variant={ContentVariant.BodySm}
                                        pii={true}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-10 md:grid-cols-1 lg:grid-cols-2">
                                <div>
                                    <Label variant={LabelVariant.FieldLabel} label={t('colDefs:owner.birthDate')} />
                                    <Content details={policyOwnerDto.birthDate} variant={ContentVariant.BodySm} pii={true} />
                                </div>
                                <div>
                                    <Label variant={LabelVariant.FieldLabel} label={contactNumberLabel} />
                                    <Content
                                        details={(contactNumber && formatPhone(contactNumber)) || DEFAULT_ERROR_STRING}
                                        variant={ContentVariant.BodySm}
                                        pii={true}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-10 md:grid-cols-1 lg:grid-cols-2">
                                <div>
                                    <Label variant={LabelVariant.FieldLabel} label={t('colDefs:owner.ssn')} />
                                    <Content
                                        details={formatSSN(policyOwnerDto.ssn)}
                                        variant={ContentVariant.BodySm}
                                        highlights={getPolicyHighlighter(searchValue)}
                                        pii={true}
                                    />
                                </div>
                                <div>
                                    <Label variant={LabelVariant.FieldLabel} label={t('colDefs:owner.mailingAddress')} />
                                    {(policyOwnerDto.mailingAddress && <FormattedAddress address={policyOwnerDto.mailingAddress} />) ||
                                        DEFAULT_ERROR_STRING}
                                </div>
                            </div>
                        </QuickViewRoot>
                        {policyQuickView()}
                    </div>
                </div>
                <KeyValuesBar policy={policy} />
            </ResponsivePadding>
        </section>
    );
};
