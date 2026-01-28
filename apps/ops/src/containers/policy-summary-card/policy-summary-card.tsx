import { Skeleton } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import {
    Icon,
    IconType,
    BannerAlert,
    BannerVariant,
} from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import {
    PropsWithChildren,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import {
    getBadgeStatus,
    getBadgeStatusVariant,
} from '@deps/components/badge/badge.helpers';
import CardInfo from '@deps/components/card/card-info/card-info';
import Content, { ContentVariant } from '@deps/components/content/content';
import { getPolicyBadgeStatusTooltip } from '@deps/components/global-values/global-values-bar/global-values-helpers';
import GlobalPolicyInfo from '@deps/components/global-values/policy-info/policy-info';
import IconButton from '@deps/components/icon-button/icon-button';
import Label, { LabelVariant } from '@deps/components/label/label';
import TempNavInactive from '@deps/components/nav-element/temp-nav-inactive/temp-nav-inactive';
import { PopoverPlacement } from '@deps/components/popover/popover';
import { QuickActionsType } from '@deps/components/quick-actions-menu/quick-actions-menu';
import SideSheetProductDetails from '@deps/components/side-sheet/side-sheet-product-details/side-sheet-product-details';
import PendingTag from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/pending-tag';
import {
    AddressWithPending,
    EmailWithPending,
    PhoneWithPending,
} from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/types';
import { TranslationFiles } from '@deps/config/translations';
import {
    FormattedAddress,
    sortAddressesByType,
} from '@deps/containers/people-data-cards/address-card/address-card.helpers';
import QuickLinks from '@deps/containers/quick-links/quick-links';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { getSearchValueObject } from '@deps/helpers/case-management';
import {
    getTotalMinRequiredAmount,
    policyDataToGlobalValues,
} from '@deps/helpers/global-values';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import {
    BasePolicyComponentArgs,
    PolicyDetails,
} from '@deps/helpers/policy-sor/PolicyDetails';
import { convertToQueryString } from '@deps/helpers/routing.helpers';
import {
    convertKebabedDateString,
    formatDate,
    formatPhone,
    formatSSN,
    isNullEmptyOrUndefined,
    toTitleCase,
} from '@deps/helpers/string.helpers';
import { mapAddressTypeToTranslation } from '@deps/helpers/translation.helpers';
import useNavLink from '@deps/hooks/useNavLink';
import { usePolicyQuickLinks } from '@deps/hooks/usePolicyQuickLinks';
import useAddOrEditPhoneOrEmailClick from '@deps/hooks/user-carrier-specific/useOnEditClick';
import { useTransactionPermissionCheck } from '@deps/hooks/useTransactionPermissionCheck';
import { CardDetailsTest } from '@deps/jest/constants/test-id-constants';
import { Statuses } from '@deps/models/case/case';
import { ProcessType } from '@deps/models/case/enums';
import { UserPermission } from '@deps/models/user-profile';
import { DashboardContext } from '@deps/pages/policies';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import {
    NonFinancialTransactionActions,
    NonFinancialTransactions,
} from '@deps/queries/api/bpm-non-financial';
import { initialDeathClaimExists } from '@deps/queries/api/web-non-financial';
import {
    getCaseSearchQuery,
    getCasesQuery,
} from '@deps/queries/tanstack/caseQueries/caseQueries';
import {
    checkEmailChangeEligibilityQuery,
    checkPhoneChangeEligibilityQuery,
} from '@deps/queries/tanstack/checkEligibilityQueries/checkEligibilityQueries';
import { hasPermissionQuery } from '@deps/queries/tanstack/permissionsQueries/permissions-queries';
import {
    getPolicyQuery,
    getPolicyQueryKey,
} from '@deps/queries/tanstack/policyQueries/policyQueries';
import { ReactComponent as CogIcon } from '@deps/styles/elements/icons/icons_outlined/cog.svg';
import { FIFTEEN_MINUTES_IN_MS } from '@deps/types/constants';
import {
    CaseSearchErrorResponse,
    CaseSearchResponse,
    PolicySearchResult,
    SearchViewQuery,
} from '@deps/types/search';
import { TransactionPermission } from '@deps/utils/auth';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { isFormFeatureEnabled } from '@deps/utils/optimizely/utils';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';
import {
    Address,
    Email,
    EmailType,
    Phone,
    PhoneType,
    Policy,
    FeatureType,
    PolicyStatus,
} from '@zinnia/api-types/types/sor';

import { ActiveQuickView } from './active-quick-view/active-quick-view';
import AnnuityQuickView from './active-quick-view/annuity';
import { LapseQuickView } from './lapse-quick-view';
import { PendingLapseQuickView } from './pending-lapse-quick-view';
import { PolicyDetailsCard } from './policy-details-card';
import { deathClaimApplicableStatuses } from './policy-summary-card.helpers';
import { default as styles } from './policy-summary-card.module.css';
import { QuickViewRoot } from './quick-view-root/quick-view-root';
import { TermQuickView } from './term-quick-view';
import { useFreelookCancellation } from '../../hooks/useFreelookCancellation';
import SideSheetAddress from '../people-data-cards/address-card/side-sheet/side-sheet-address';
import { sortEmailsByType } from '../people-data-cards/email-card/email-card.helpers';
import SideSheetEmail from '../people-data-cards/email-card/side-sheet/side-sheet-email';
import { sortPhonesByType } from '../people-data-cards/phone-card/phone-card.helpers';
import { SideSheetPhone } from '../people-data-cards/phone-card/side-sheet/side-sheet-phone';
import SideSheetPeopleHeader from '../people-data-cards/side-sheet-people-header/side-sheet-people-header';

interface SummaryCardProps extends PropsWithChildren {
    policySearchResult: PolicySearchResult;
    showKeyValues?: boolean;
}

enum SideSheetViews {
    PHONE = 'PHONE',
    EMAIL = 'EMAIL',
    ADDRESS = 'ADDRESS',
}

export const getPolicyHighlighter = ({
    firstName,
    lastName,
    policyNumber,
    ssn,
}: SearchViewQuery) => {
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

const QuickViewHeader = ({
    policy,
    loadingPolicyDetails = false,
}: { loadingPolicyDetails?: boolean } & BasePolicyComponentArgs) => {
    const { t } = useTranslation([
        TranslationFiles.COMMON,
        TranslationFiles.COLDEFS,
    ]);
    const { searchValue } = useContext(DashboardContext);
    const {
        partyId: userPartyId,
        sessionId,
        hasCallLogsAccess,
        hasDocumentAccess,
    } = usePermissionsContext();

    const {
        carrierId,
        marketingName,
        planName,
        policyNumber,
        policyStatus,
        productType,
    } = policy;
    const totalMinRequiredAmount = getTotalMinRequiredAmount(policy);
    const globalValuesData = useMemo(
        () => policyDataToGlobalValues(policy, t),
        [policy, t]
    );
    const sideSheet = useSideSheetContext();
    const openDetailsSidesheet = () => {
        sideSheet.changeSideSheetContent(
            <GlobalPolicyInfo
                tooltipPlacements={PopoverPlacement.BottomLeft}
                {...globalValuesData}
            />,
            <SideSheetProductDetails globalValues={globalValuesData} />
        );
        sideSheet.handleOpen(true);
    };

    const pendingLapse = policy.features.getFirstFeatureByType(
        FeatureType.LAPSEASSESSMENT
    );
    const showPendingLapse =
        policyStatus === PolicyStatus.PENDINGLAPSE ? true : false;

    const getTooltipText = (status: PolicyStatus | undefined): string => {
        switch (status) {
            case PolicyStatus.PENDINGLAPSE:
            case PolicyStatus.LAPSE:
                return t(getPolicyBadgeStatusTooltip(policyStatus), {
                    tooltipDate: formatDate(pendingLapse?.endDate),
                    tooltipAmount: showPendingLapse
                        ? numberFormatify(
                              pendingLapse?.totalMinimumRequiredAmount
                          )
                        : numberFormatify(totalMinRequiredAmount),
                });
            case PolicyStatus.TERMINATED:
                return t(getPolicyBadgeStatusTooltip(policyStatus), {
                    tooltipDate: formatDate(policy?.policyTerminationDate),
                });
            case PolicyStatus.MATURED:
                return t(getPolicyBadgeStatusTooltip(policyStatus), {
                    tooltipDate: formatDate(policy?.maturityDate),
                });
            case PolicyStatus.DEATHCLAIMPAID:
                return t(getPolicyBadgeStatusTooltip(policyStatus), {
                    dateOfDeathReported:
                        policy?.dateOfDeathReportedNotification,
                    claimApprovalDate: policy?.claimApprovalDate,
                });
            case PolicyStatus.DEATHCLAIMPENDING:
                return t(getPolicyBadgeStatusTooltip(policyStatus), {
                    tooltipDate: policy?.dateOfDeathReportedNotification,
                });
            default:
                return t(getPolicyBadgeStatusTooltip(policyStatus), {
                    tooltipDate: formatDate(policy?.issueDate),
                });
        }
    };

    const { data: quickLinks, isLoading: loadingQuickLinks } =
        usePolicyQuickLinks(t, policy, hasCallLogsAccess, hasDocumentAccess);

    return (
        <header data-testid={CardDetailsTest.HEADER}>
            <div className="flex w-full items-end justify-between">
                <div className="w-full flex-wrap flex lg:items-end lg:justify-between gap-8">
                    <GlobalPolicyInfo
                        loadingPolicyDetails={loadingPolicyDetails}
                        carrierId={carrierId}
                        marketingName={marketingName}
                        planName={planName}
                        productType={productType}
                        policyNumber={policyNumber}
                        highlight={searchValue?.policyNumber}
                        status={t(getBadgeStatus(policyStatus))}
                        variant={getBadgeStatusVariant(policyStatus)}
                        tooltip={getTooltipText(policyStatus) ?? ''}
                        openSideSheet={openDetailsSidesheet}
                    />
                    <div className="flex flex-wrap gap-x-8 gap-y-4">
                        <Skeleton
                            loading={loadingPolicyDetails || loadingQuickLinks}
                            maxWidth="550px"
                            height="24px"
                        >
                            <QuickLinks
                                userPartyId={userPartyId}
                                policy={policy}
                                links={quickLinks || []}
                                sessionId={sessionId}
                                type={QuickActionsType.Policy}
                            />
                        </Skeleton>
                    </div>
                </div>
            </div>
            <hr className="my-4 h-0.5 border-none bg-gray-100" />
        </header>
    );
};

export const StatusBanner = ({
    policy,
    casesTotal,
}: BasePolicyComponentArgs & { casesTotal?: number }) => {
    const { t } = useTranslation();
    const { setAriaLabelToChildLinks } = useNavLink();
    const bannerRef = useRef<HTMLDivElement | null>(null);
    const policyStatus = policy.policyStatus;
    const { featureFlags } = useOptimizely();
    const freeLookEnabled =
        featureFlags[FEATURE_FLAGS.POLICY_FREE_LOOK_CANCELLATION];
    const isNewDeathClaimEnabled = isFormFeatureEnabled(
        ProcessType.IDN_DEATH_CLAIM,
        policy?.carrierId as string,
        featureFlags
    );
    const showCaseBanner = !!casesTotal && casesTotal > 0;
    const { data: freelookCancellation } = useFreelookCancellation(
        policy.planCode,
        policy.policyNumber
    );

    // TODO - BPB: Policy Features Helper Class
    const reinstatementWithApproval = policy.policy.policyFeatures?.find(
        (pf) => pf.featureType === FeatureType.REINSTATEMENT && pf.approvalDate
    );

    const [isNewDeathClaim, setIsNewDeathClaim] = useState(null);
    const [zlCaseId, setZlCaseId] = useState(null);
    const isDeathClaimStatusApplicable =
        deathClaimApplicableStatuses.includes(policyStatus);

    const { isPermissioned: isUserPermissionedToWrite } =
        useTransactionPermissionCheck(
            TransactionPermission.WritePolicy,
            policy.policyNumber,
            policy.planCode
        );

    useEffect(() => {
        const checkIsNewDeathClaim = async () => {
            const response = await initialDeathClaimExists(
                policy.policyNumber,
                policy?.carrierId
            );
            if (response?.isNewRequest) {
                setIsNewDeathClaim(response.isNewRequest);
            } else {
                setIsNewDeathClaim(response?.isNewRequest || null);
                setZlCaseId(response?.zlCaseId || null);
            }
        };
        if (policyStatus && isDeathClaimStatusApplicable) {
            // isDeathClaimNotApplicable) {
            checkIsNewDeathClaim();
        }
    }, [
        policy.policyNumber,
        policy?.carrierId,
        policyStatus,
        isDeathClaimStatusApplicable,
    ]);

    const searchValueObject = useMemo(() => {
        if (isNullEmptyOrUndefined(zlCaseId)) {
            return;
        }
        const svo = getSearchValueObject({ caseId: zlCaseId }, 'caseId');
        return {
            ...svo,
            limit: 1,
            offset: 0,
            sortDirection: 'asc',
            sortBy: 'createdAt',
        };
    }, [zlCaseId]);

    const { data: caseStatus } = useQuery({
        queryKey: ['cases', searchValueObject, featureFlags],
        queryFn: () => getCaseSearchQuery(searchValueObject, featureFlags),
        select: (data) => {
            return data?.data?.[0]?.caseStatus || null;
        },
    });

    useEffect(() => {
        // Adding necessary logic to set aria-label to BannerAlert since it is not a component property
        if (bannerRef.current) {
            setAriaLabelToChildLinks(
                bannerRef,
                t('dashboard.search.results.policySummaryCard.caseBannerLink')
            );
        }
    }, [showCaseBanner, setAriaLabelToChildLinks, t]);

    return (
        <div className={styles.bannerContainer}>
            {showCaseBanner && (
                <BannerAlert
                    ref={bannerRef}
                    variant={BannerVariant.Information}
                    bodyText={t(
                        'dashboard.search.results.policySummaryCard.caseBannerText',
                        { count: casesTotal }
                    )}
                    cta={{
                        href: `/cases${convertToQueryString({
                            policyNumber: policy.policyNumber || '',
                        })}`,
                        text: t(
                            'dashboard.search.results.policySummaryCard.caseBannerLink'
                        ),
                        target: '_blank',
                    }}
                />
            )}

            {policyStatus === PolicyStatus.PENDINGLAPSE && (
                <BannerAlert
                    variant={BannerVariant.Warning}
                    cta={
                        isUserPermissionedToWrite
                            ? {
                                  href: `/policies/${policy.planCode}/${policy.policyNumber}/policy/premiums/new-premium/`,
                                  text: t(
                                      'dashboard.search.results.policySummaryCard.pendingLapseBannerLink'
                                  ),
                              }
                            : {
                                  href: '#',
                                  text: (
                                      <TempNavInactive
                                          tooltipBody={t(
                                              'dashboard.search.results.policySummaryCard.BannerLink.permissionDeniedTooltip',
                                              {
                                                  carrier: policy.carrierName,
                                              }
                                          )}
                                          hideIcon
                                          navElementClassName="!bg-transparent !p-0"
                                      >
                                          {t(
                                              'dashboard.search.results.policySummaryCard.pendingLapseBannerLink'
                                          )}
                                      </TempNavInactive>
                                  ) as unknown as string,
                              }
                    }
                    bodyText={t(
                        'dashboard.search.results.policySummaryCard.pendingLapseBannerText'
                    )}
                />
            )}

            {policyStatus === PolicyStatus.LAPSE &&
                !!reinstatementWithApproval && (
                    <BannerAlert
                        variant={BannerVariant.Error}
                        cta={
                            isUserPermissionedToWrite
                                ? {
                                      href: `/policies/${policy.planCode}/${policy.policyNumber}/policy/premiums/new-premium/`,
                                      text: t(
                                          'dashboard.search.results.policySummaryCard.lapseBannerLink'
                                      ),
                                  }
                                : {
                                      href: '#',
                                      text: (
                                          <TempNavInactive
                                              tooltipBody={t(
                                                  'dashboard.search.results.policySummaryCard.BannerLink.permissionDeniedTooltip',
                                                  {
                                                      carrier:
                                                          policy.carrierName,
                                                  }
                                              )}
                                              hideIcon
                                              navElementClassName="!bg-transparent !p-0"
                                          >
                                              {t(
                                                  'dashboard.search.results.policySummaryCard.lapseBannerLink'
                                              )}
                                          </TempNavInactive>
                                      ) as unknown as string,
                                  }
                        }
                        bodyText={t(
                            'dashboard.search.results.policySummaryCard.lapseBannerText'
                        )}
                    />
                )}

            {freeLookEnabled &&
                freelookCancellation?.isEligibleFreelookCancellation &&
                policy.freeLookPeriodDetails.isInFreeLookPeriod && (
                    <BannerAlert
                        variant={BannerVariant.Information}
                        bodyText={t(
                            'dashboard.search.results.policySummaryCard.freeLookCancelBannerText',
                            {
                                endDate: convertKebabedDateString(
                                    policy.freeLookPeriodDetails?.endDate
                                ),
                            }
                        )}
                        cta={
                            isUserPermissionedToWrite
                                ? {
                                      href: `/policies/${policy.planCode}/${policy.policyNumber}/policy/freelook/cancel-freelook/`,
                                      text: t(
                                          'dashboard.search.results.policySummaryCard.freeLookCancelBannerLink'
                                      ),
                                  }
                                : {
                                      href: '#',
                                      text: (
                                          <TempNavInactive
                                              tooltipBody={t(
                                                  'dashboard.search.results.policySummaryCard.BannerLink.permissionDeniedTooltip',
                                                  {
                                                      carrier:
                                                          policy.carrierName,
                                                  }
                                              )}
                                              hideIcon
                                              navElementClassName="!bg-transparent !p-0"
                                          >
                                              {t(
                                                  'dashboard.search.results.policySummaryCard.freeLookCancelBannerLink'
                                              )}
                                          </TempNavInactive>
                                      ) as unknown as string,
                                  }
                        }
                    />
                )}

            {isNewDeathClaimEnabled &&
                !isNewDeathClaim &&
                zlCaseId &&
                isDeathClaimStatusApplicable &&
                caseStatus !== Statuses.Canceled && (
                    <BannerAlert
                        variant={BannerVariant.Warning}
                        cta={
                            isUserPermissionedToWrite
                                ? {
                                      href: `/cases/${zlCaseId}/progress`,
                                      text: t(
                                          'dashboard.search.results.policySummaryCard.initialDeathNotificationLink'
                                      ),
                                  }
                                : {
                                      href: '#',
                                      text: (
                                          <TempNavInactive
                                              tooltipBody={t(
                                                  'dashboard.search.results.policySummaryCard.BannerLink.permissionDeniedTooltip',
                                                  {
                                                      carrier:
                                                          policy.carrierName,
                                                  }
                                              )}
                                              hideIcon
                                              navElementClassName="!bg-transparent !p-0"
                                          >
                                              {t(
                                                  'dashboard.search.results.policySummaryCard.initialDeathNotificationLink'
                                              )}
                                          </TempNavInactive>
                                      ) as unknown as string,
                                  }
                        }
                        bodyText={t(
                            'dashboard.search.results.policySummaryCard.initialDeathNotification'
                        )}
                    />
                )}
        </div>
    );
};

export const QuickViewModule = ({ policy }: BasePolicyComponentArgs) => {
    if (policy.isTerm) {
        return <TermQuickView policy={policy} />;
    } else if (policy.isLife) {
        switch (policy.policyStatus) {
            case PolicyStatus.PENDINGLAPSE:
                return <PendingLapseQuickView policy={policy} />;
            case PolicyStatus.LAPSE:
                return <LapseQuickView policy={policy} />;
            default:
                return <ActiveQuickView policy={policy} />;
        }
    } else if (policy.isAnnuity) {
        return <AnnuityQuickView policy={policy} />;
    }
};

export const OwnerInformation = ({ policy }: BasePolicyComponentArgs) => {
    const { t } = useTranslation([
        TranslationFiles.COMMON,
        TranslationFiles.COLDEFS,
    ]);
    const { searchValue } = useContext(DashboardContext);
    const { owner } = policy;
    const { partyId } = usePermissionsContext();

    const sideSheet = useSideSheetContext();

    const { data: canEditPolicy } = useQuery({
        queryKey: [
            'canEditPolicy',
            policy.policyNumber,
            policy.planCode,
            partyId,
        ],
        queryFn: () =>
            hasPermissionQuery(
                UserPermission.AllowEditPolicy,
                `policy:${policy.policyNumber}_${policy.planCode}`,
                partyId
            ),
        placeholderData: (previousData) => previousData,
        staleTime: FIFTEEN_MINUTES_IN_MS,
    });
    const { data: phoneChangeEligibility } = useQuery({
        queryKey: [
            'checkPhoneChangeEligibilityQuery',
            policy.planCode,
            policy.policyNumber,
            policy.policyNumber,
        ],
        queryFn: () =>
            checkPhoneChangeEligibilityQuery(
                policy.planCode as string,
                policy.policyNumber as string
            ),
        placeholderData: (previousData) => previousData,
        select: (data) => {
            return {
                ...data,
                isEligiblePhoneChange:
                    data?.status === TransactionResponseStatus.Success,
            };
        },
    });
    const { data: emailChangeEligibility } = useQuery({
        queryKey: [
            'emailChangeEligibility',
            policy.planCode,
            policy.policyNumber,
        ],
        queryFn: () =>
            checkEmailChangeEligibilityQuery(
                policy.planCode as string,
                policy.policyNumber as string
            ),
        placeholderData: (previousData) => previousData,
        select: (data) => {
            return {
                ...data,
                isEligibleEmailChange:
                    data?.status === TransactionResponseStatus.Success,
            };
        },
    });

    const emails = owner?.bestAvailableEmail
        ? [owner?.bestAvailableEmail]
        : undefined;
    const emailTypeKey =
        owner?.bestAvailableEmail?.emailType?.toLocaleLowerCase() ??
        EmailType.PERSONAL.toLocaleLowerCase();
    const [currentEmails, setCurrentEmails] = useState<Email[]>(
        sortEmailsByType({ emails })
    );
    const bestAvailEmail = currentEmails[0] as EmailWithPending;

    const phoneTypeKey =
        owner?.bestAvailablePhone?.phoneType?.toLocaleLowerCase() ||
        PhoneType.HOME;
    const phones = owner?.bestAvailablePhone
        ? [owner?.bestAvailablePhone]
        : undefined;
    const [currentPhones, setCurrentPhones] = useState<Phone[]>(
        sortPhonesByType({ phones })
    );
    const bestAvailPhone = currentPhones[0] as PhoneWithPending;
    const contactNumberLabel = bestAvailPhone
        ? t(
              `people.card.phone.phoneOptions.${bestAvailPhone.phoneType?.toLocaleLowerCase()}`
          )
        : t('colDefs:owner.primaryPhone');

    const addressType = owner?.bestAvailableAddress?.addressType;
    const addresses = owner?.bestAvailableAddress
        ? [owner?.bestAvailableAddress]
        : undefined;
    const preferredAddressIndicator = owner?.preferredAddress?.addressId;
    const [currentAddresses, setCurrentAddresses] = useState<Address[]>(
        sortAddressesByType({ addresses, preferredAddressIndicator })
    );
    const bestAvailAddress = currentAddresses[0] as AddressWithPending;

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
                        typeTranslation={
                            t(
                                `people.card.email.emailOptions.${emailTypeKey}`
                            ) as string
                        }
                    />
                );
                content = (
                    <SideSheetEmail
                        isOnlyEmail={currentEmails.length === 1}
                        onCancel={() => sideSheet.handleOpen(false)}
                        party={owner?.party}
                        planCode={policy.planCode}
                        policy={policy.policy}
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
                        typeTranslation={
                            t(
                                `people.card.phone.phoneOptions.${phoneTypeKey}`
                            ) as string
                        }
                    />
                );
                content = (
                    <SideSheetPhone
                        onCancel={() => sideSheet.handleOpen(false)}
                        party={owner?.party}
                        planCode={policy.planCode}
                        policy={policy.policy}
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
                        typeTranslation={
                            t(
                                mapAddressTypeToTranslation({ addressType, t })
                            ) as string
                        }
                    />
                );
                content = (
                    <SideSheetAddress
                        isCurrentMailingAddress={
                            preferredAddressIndicator ===
                            bestAvailAddress.addressId
                        }
                        isOnlyAddress={currentAddresses?.length === 1}
                        onCancel={() => sideSheet.handleOpen(false)}
                        party={owner?.party}
                        planCode={policy.planCode}
                        policyNumber={policy.policyNumber}
                        policy={policy.policy}
                        setCurrentAddresses={setCurrentAddresses}
                        updateAddress={bestAvailAddress ?? undefined}
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

    const onEditClick = useAddOrEditPhoneOrEmailClick<SideSheetViews>({
        defaultCallback: openSideSheet,
        party: owner?.party,
    });

    const handleEditEmailClick = () => onEditClick(SideSheetViews.EMAIL);
    const handleEditPhoneClick = () => onEditClick(SideSheetViews.PHONE);

    return (
        <QuickViewRoot
            title={t('dashboard.search.results.policySummaryCard.header1')}
        >
            <div>
                <Label
                    variant={LabelVariant.FieldLabel}
                    label={t('colDefs:owner.fullName')}
                />
                <Content
                    details={
                        toTitleCase(owner?.fullName) || DEFAULT_ERROR_STRING
                    }
                    variant={ContentVariant.BodySm}
                    highlights={getPolicyHighlighter(searchValue)}
                    pii={true}
                />
            </div>
            <div>
                <div className="flex gap-1">
                    <Label
                        id="policy-owner-email"
                        variant={LabelVariant.FieldLabel}
                        label={t('colDefs:owner.email')}
                    />
                    {bestAvailEmail?.isPending && <PendingTag />}
                    {canEditPolicy &&
                    bestAvailEmail &&
                    emailChangeEligibility?.isEligibleEmailChange ? (
                        <IconButton
                            aria-describedby="policy-owner-email"
                            onClick={handleEditEmailClick}
                        >
                            <Icon
                                type={IconType.EDIT_ALT}
                                height={16}
                                width={16}
                            />
                        </IconButton>
                    ) : (
                        <IconButton
                            aria-describedby="policy-owner-email"
                            onClick={handleEditEmailClick}
                            disabled={true}
                        >
                            <Icon
                                type={IconType.EDIT_ALT}
                                height={16}
                                width={16}
                            />
                        </IconButton>
                    )}
                </div>
                <Content
                    details={
                        bestAvailEmail?.emailAddress || DEFAULT_ERROR_STRING
                    }
                    variant={ContentVariant.BodySm}
                    pii={true}
                />
            </div>
            <div>
                <Label
                    variant={LabelVariant.FieldLabel}
                    label={t('colDefs:owner.birthDate')}
                />
                <Content
                    details={owner?.formattedBirthDate}
                    variant={ContentVariant.BodySm}
                    pii={true}
                />
            </div>
            <div>
                <div className="flex gap-1">
                    <Label
                        id="policy-owner-phone"
                        variant={LabelVariant.FieldLabel}
                        label={contactNumberLabel}
                    />
                    {bestAvailPhone?.isPending && <PendingTag />}
                    {canEditPolicy &&
                    bestAvailPhone &&
                    phoneChangeEligibility?.isEligiblePhoneChange ? (
                        <IconButton
                            aria-describedby="policy-owner-phone"
                            onClick={handleEditPhoneClick}
                        >
                            <Icon
                                type={IconType.EDIT_ALT}
                                height={16}
                                width={16}
                            />
                        </IconButton>
                    ) : (
                        <IconButton
                            aria-describedby="policy-owner-phone"
                            onClick={handleEditPhoneClick}
                            disabled={true}
                        >
                            <Icon
                                type={IconType.EDIT_ALT}
                                height={16}
                                width={16}
                            />
                        </IconButton>
                    )}
                </div>
                <Content
                    details={
                        (bestAvailPhone && formatPhone(bestAvailPhone)) ||
                        DEFAULT_ERROR_STRING
                    }
                    variant={ContentVariant.BodySm}
                    pii={true}
                />
            </div>
            <div>
                <Label
                    variant={LabelVariant.FieldLabel}
                    label={t('colDefs:owner.ssn')}
                />
                <Content
                    details={formatSSN(owner?.ssn)}
                    variant={ContentVariant.BodySm}
                    highlights={getPolicyHighlighter(searchValue)}
                    pii={true}
                />
            </div>
            <div>
                <div className="flex gap-1">
                    <Label
                        id="policy-owner-address"
                        variant={LabelVariant.FieldLabel}
                        label={t('colDefs:owner.mailingAddress')}
                    />
                    {bestAvailAddress?.isPending && <PendingTag />}
                    {canEditPolicy && bestAvailAddress && (
                        <IconButton
                            aria-describedby="policy-owner-address"
                            onClick={() =>
                                openSideSheet(SideSheetViews.ADDRESS)
                            }
                        >
                            <Icon
                                type={IconType.EDIT_ALT}
                                height={16}
                                width={16}
                            />
                        </IconButton>
                    )}
                </div>
                {(bestAvailAddress && (
                    <FormattedAddress address={bestAvailAddress} />
                )) ||
                    DEFAULT_ERROR_STRING}
            </div>
        </QuickViewRoot>
    );
};

export function PolicyQuickView({
    policyDetails,
    caseData,
    isLoading = false,
    showKeyValues = false,
}: {
    policyDetails: PolicyDetails;
    caseData: CaseSearchResponse | CaseSearchErrorResponse | undefined;
    isLoading: boolean;
    showKeyValues?: boolean;
}) {
    return (
        <section
            data-testid={CardDetailsTest.CARD}
            className={styles.quickViewCard}
        >
            <QuickViewHeader
                policy={policyDetails}
                loadingPolicyDetails={isLoading}
            />
            <PolicyDetailsCard
                isLoading={isLoading}
                policyDetails={policyDetails}
                caseData={caseData}
                showKeyValues={showKeyValues}
            />
        </section>
    );
}

export default function PolicySummaryCard({
    policySearchResult,
    showKeyValues = false,
}: SummaryCardProps) {
    const { t } = useTranslation();
    const {
        data: policyDetails = new PolicyDetails(),
        isLoading: isLoadingPolicyDetails,
        isError,
    } = useQuery({
        queryKey: [
            getPolicyQueryKey,
            policySearchResult?.policyNumber,
            policySearchResult?.planCode,
        ],
        queryFn: () =>
            getPolicyQuery(
                policySearchResult?.policyNumber,
                policySearchResult?.planCode
            ),
        select: (data) => {
            return new PolicyDetails(data);
        },
    });

    const { featureFlags } = useOptimizely();

    const { data: caseData } = useQuery({
        queryKey: ['caseData', policySearchResult.policyNumber, featureFlags],
        queryFn: () =>
            getCasesQuery(policySearchResult.policyNumber, featureFlags),
        placeholderData: (previousData) => previousData,
    });

    const partialPolicyDetails = useMemo(() => {
        if (!policySearchResult) return new PolicyDetails();

        // Create a partial policy object with available data
        const partialPolicy: Partial<Policy> = {
            policyNumber: policySearchResult.policyNumber,
            carrierId: policySearchResult.carrierId,
            policyStatus:
                policySearchResult.policyStatus?.toUpperCase() as PolicyStatus,
            product: { planCode: policySearchResult.planCode },
        };

        // Filter out undefined values
        const filteredPolicy = Object.fromEntries(
            Object.entries(partialPolicy).filter(
                ([, value]) => value !== undefined
            )
        );

        return new PolicyDetails(filteredPolicy as Policy);
    }, [policySearchResult]);

    if (isError) {
        return (
            <section className={`${styles.quickViewCard}`}>
                <CardInfo
                    icon={
                        <CogIcon
                            className="text-semantic-error"
                            height={50}
                            width={50}
                        />
                    }
                    title={t(
                        'dashboard.search.results.policySummaryCard.errorTitle'
                    )}
                    subtitle={t(
                        'dashboard.search.results.policySummaryCard.errorSubtitle',
                        {
                            policyNumber: policySearchResult?.policyNumber,
                        }
                    )}
                    className="self-center"
                />
            </section>
        );
    }
    const currentPolicyDetails = isLoadingPolicyDetails
        ? partialPolicyDetails
        : policyDetails;

    return (
        <PolicyQuickView
            policyDetails={currentPolicyDetails}
            caseData={caseData}
            isLoading={isLoadingPolicyDetails}
            showKeyValues={showKeyValues}
        />
    );
}
