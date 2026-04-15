import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Icon, IconType } from '@zinnia/bloom/components';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'next-i18next';

import MenuContextual from '@deps/components/menu-contextual/menu-contextual';
import MenuContextualItem from '@deps/components/menu-contextual/menu-contextual-item/menu-contextual-item';
import MenuContextualLabel from '@deps/components/menu-contextual/menu-contextual-label/menu-contextual-label';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { PolicyRole } from '@deps/constants/policy';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import {
    getRjsfDevStoreBaseUrl,
    listRjsfDevStore,
} from '@deps/lib/transaction-builder/rjsf-dev-store';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import {
    checkBeneficiaryEligibilityQuery,
    checkManagRoleEligibilityQuery,
} from '@deps/queries/tanstack/checkEligibilityQueries/checkEligibilityQueries';
import {
    PolicyClickedEvent,
    SegmentTrackedEventName,
} from '@deps/types/segment-analytics';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import styles from './manage-people.module.css';

type ManagePeopleMenuLink = {
    href: string;
    name: string;
    hideLabel: boolean;
    isEligible: boolean | undefined;
    shouldShow: boolean;
    openInNewTab?: boolean;
};

const ManagePeople = ({ policy }: { policy: PolicyDetails }) => {
    const { t } = useTranslation();
    const { featureFlags } = useOptimizely();
    const { sessionId, partyId: userPartyId } = usePermissionsContext();
    const searchParams = useSearchParams();
    const correlationId = searchParams?.get('correlationId');
    const shouldShowOwnerChange =
        featureFlags[FEATURE_FLAGS.OWNER_CHANGE_TRANSACTION];
    const shouldShowJointOwnerChange =
        featureFlags[FEATURE_FLAGS.JOINT_OWNER_CHANGE_TRANSACTION];
    const shouldShowPayorChange =
        featureFlags[FEATURE_FLAGS.PAYOR_CHANGE_TRANSACTION];
    const shouldShowThirdPartyDesigneeChange =
        featureFlags[FEATURE_FLAGS.THIRD_PARTY_DESIGNEE_TRANSACTION];
    const shouldShowBeneficiaryChange =
        featureFlags[FEATURE_FLAGS.BENEFICIARY_CHANGE_TRANSACTION];
    const shouldShowAssigneeChange =
        featureFlags[FEATURE_FLAGS.ASSIGNEE_CHANGE_TRANSACTION];
    const shouldShowPayeeChange =
        featureFlags[FEATURE_FLAGS.PAYEE_CHANGE_TRANSACTION];
    const shouldShowAnnuitantChange =
        featureFlags[FEATURE_FLAGS.ANNUITANT_CHANGE_TRANSACTION];

    const useRoleManagementEligibility = (
        policy: { planCode?: string; policyNumber?: string },
        role: PolicyRole,
        options?: Omit<
            UseQueryOptions<any, unknown, any, string[]>,
            'queryKey' | 'queryFn' | 'select'
        >
    ) => {
        const eligibilityKey = `isEligibleManage${role}` as const;
        const planCode = policy.planCode ?? '';
        const policyNumber = policy.policyNumber ?? '';

        return useQuery({
            queryKey:
                role === PolicyRole.BENEFICIARY
                    ? ['beneficiaryEligibility', planCode, policyNumber]
                    : [
                          `checkManage${role}EligibilityQuery`,
                          planCode,
                          policyNumber,
                          role,
                      ],
            queryFn: () =>
                role === PolicyRole.BENEFICIARY
                    ? checkBeneficiaryEligibilityQuery(planCode, policyNumber)
                    : checkManagRoleEligibilityQuery(
                          planCode,
                          policyNumber,
                          role
                      ),
            placeholderData: (previousData) => previousData,
            select: (data) => ({
                ...data,
                [eligibilityKey]:
                    data?.status === TransactionResponseStatus.Success,
            }),
            ...options,
        });
    };

    const { data: manageOwnerEligibility } = useRoleManagementEligibility(
        policy,
        PolicyRole.OWNER
    );

    const { data: manageJointOwnerEligibility } = useRoleManagementEligibility(
        policy,
        PolicyRole.JOINTOWNER
    );
    const { data: managePayorEligibility } = useRoleManagementEligibility(
        policy,
        PolicyRole.PAYOR
    );
    const { data: manageThirdPartyDesigneeEligibility } =
        useRoleManagementEligibility(policy, PolicyRole.THIRDPARTYDESIGNEE);
    const { data: manageBeneficiaryEligibility } = useRoleManagementEligibility(
        policy,
        PolicyRole.BENEFICIARY
    );
    const { data: manageAssigneeEligibilty } = useRoleManagementEligibility(
        policy,
        PolicyRole.ASSIGNEE
    );
    const { data: managePayeeEligibilty } = useRoleManagementEligibility(
        policy,
        PolicyRole.PAYEE
    );
    const { data: manageAnnuitantEligibility } = useRoleManagementEligibility(
        policy,
        PolicyRole.ANNUITANT
    );
    const withCorrelationId = (href: string) => {
        if (!correlationId) return href;

        const separator = href.includes('?') ? '&' : '?';
        return `${href}${separator}correlationId=${encodeURIComponent(
            correlationId
        )}`;
    };

    const rjsfDevStoreBaseUrl = getRjsfDevStoreBaseUrl();
    const { data: rjsfDevStoreItems = [] } = useQuery({
        queryKey: ['rjsfDevStoreSchemas', rjsfDevStoreBaseUrl],
        queryFn: listRjsfDevStore,
        enabled: !!rjsfDevStoreBaseUrl,
        staleTime: 5_000,
        refetchOnWindowFocus: true,
    });

    const links = [
        {
            href: withCorrelationId(
                t('site.navLinks.owner.link', {
                    id: policy.policyNumber,
                    planCode: policy.planCode,
                })
            ),
            name: t('site.navLinks.owner.text'),
            hideLabel: false,
            isEligible: manageOwnerEligibility?.isEligibleManageOwner,
            shouldShow: shouldShowOwnerChange,
        },
        {
            href: withCorrelationId(
                t('site.navLinks.jointOwner.link', {
                    id: policy.policyNumber,
                    planCode: policy.planCode,
                })
            ),
            name: t('site.navLinks.jointOwner.text'),
            hideLabel: false,
            isEligible: manageJointOwnerEligibility?.isEligibleManageJointOwner,
            shouldShow: shouldShowJointOwnerChange,
        },
        {
            href: withCorrelationId(
                t('site.navLinks.payor.link', {
                    id: policy.policyNumber,
                    planCode: policy.planCode,
                })
            ),
            name: t('site.navLinks.payor.text'),
            hideLabel: false,
            isEligible: managePayorEligibility?.isEligibleManagePayor,
            shouldShow: shouldShowPayorChange,
        },
        {
            href: withCorrelationId(
                t('site.navLinks.thirdPartyDesignee.link', {
                    id: policy.policyNumber,
                    planCode: policy.planCode,
                })
            ),
            name: t('site.navLinks.thirdPartyDesignee.text'),
            hideLabel: false,
            isEligible:
                manageThirdPartyDesigneeEligibility?.isEligibleManageThirdPartyDesignee,
            shouldShow: shouldShowThirdPartyDesigneeChange,
        },
        {
            href: withCorrelationId(
                t('site.navLinks.beneficiary.link', {
                    id: policy.policyNumber,
                    planCode: policy.planCode,
                })
            ),
            name: t('site.navLinks.beneficiary.text'),
            hideLabel: false,
            isEligible:
                manageBeneficiaryEligibility?.isEligibleManageBeneficiary,
            shouldShow: shouldShowBeneficiaryChange,
        },
        {
            href: t('site.navLinks.assignee.link', {
                id: policy.policyNumber,
                planCode: policy.planCode,
            }),
            name: t('site.navLinks.assignee.text'),
            hideLabel: false,
            isEligible: manageAssigneeEligibilty?.isEligibleManageAssignee,
            shouldShow: shouldShowAssigneeChange,
        },
        {
            href: t('site.navLinks.annuitant.link', {
                id: policy.policyNumber,
                planCode: policy.planCode,
            }),
            name: t('site.navLinks.annuitant.text'),
            hideLabel: false,
            isEligible: manageAnnuitantEligibility?.isEligibleManageAnnuitant,
            shouldShow: shouldShowAnnuitantChange,
        },
        {
            href: t('site.navLinks.payee.link', {
                id: policy.policyNumber,
                planCode: policy.planCode,
            }),
            name: t('site.navLinks.payee.text'),
            hideLabel: false,
            isEligible: managePayeeEligibilty?.isEligibleManagepayee,
            shouldShow: shouldShowPayeeChange,
        },
    ];

    const plan = policy.planCode ?? '';
    const policyNumber = policy.policyNumber ?? '';
    const aiGeneratedLinks =
        rjsfDevStoreBaseUrl && plan && policyNumber
            ? rjsfDevStoreItems.map((item) => ({
                  href: withCorrelationId(
                      `/policies/${encodeURIComponent(
                          plan
                      )}/${encodeURIComponent(
                          policyNumber
                      )}/people/${encodeURIComponent(
                          item.peopleSlug
                      )}?aiPaperKey=${encodeURIComponent(item.id)}`
                  ),
                  name: `${item.label} · ${item.id}`,
                  hideLabel: false,
                  isEligible: true,
                  shouldShow: true,
                  openInNewTab: false as boolean,
              }))
            : [];

    const visibleLinks: ManagePeopleMenuLink[] = [
        ...links.filter((link) => link.shouldShow),
        ...aiGeneratedLinks,
    ];

    const trackClick = (linkName: string, linkUrl: string) => {
        segmentAnalyticsTrackEvent<PolicyClickedEvent>(
            SegmentTrackedEventName.DropdownClicked,
            {
                contractNumber: policy.policyNumber,
                linkName,
                linkUrl,
                authSessionId: sessionId,
                userId: userPartyId,
            }
        );
    };

    return (
        <MenuContextual
            key={'manage_people'}
            trigger={
                <Typography
                    className="block"
                    variant={TypographyVariant.NavLinks}
                    data-testid="manage-people"
                >
                    <span className={styles.managePeopleLink}>
                        {t('people.managePeople')}
                        <Icon
                            type={IconType.CHEVRON}
                            height={16}
                            width={16}
                            className="ml-1"
                        />
                    </span>
                </Typography>
            }
        >
            <MenuContextualLabel label={'Manage people'} hideLabel={true}>
                {visibleLinks.map((link) => {
                    return (
                        <MenuContextualItem
                            content={link.name}
                            href={link.href}
                            key={link.href}
                            openInNewTab={
                                link.openInNewTab !== undefined
                                    ? link.openInNewTab
                                    : !!link.isEligible
                            }
                            disabled={!link.isEligible}
                            onClick={() => trackClick(link.name, link.href)}
                        />
                    );
                })}
            </MenuContextualLabel>
        </MenuContextual>
    );
};

export default ManagePeople;
