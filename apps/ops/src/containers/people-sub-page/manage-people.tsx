import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Icon, IconType } from '@zinnia/bloom/components';
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

const ManagePeople = ({ policy }: { policy: PolicyDetails }) => {
    const { t } = useTranslation();
    const { featureFlags } = useOptimizely();
    const { sessionId, partyId: userPartyId } = usePermissionsContext();
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

    const links = [
        {
            href: t('site.navLinks.owner.link', {
                id: policy.policyNumber,
                planCode: policy.planCode,
            }),
            name: t('site.navLinks.owner.text'),
            hideLabel: false,
            isEligible: manageOwnerEligibility?.isEligibleManageOwner,
            shouldShow: shouldShowOwnerChange,
        },
        {
            href: t('site.navLinks.jointOwner.link', {
                id: policy.policyNumber,
                planCode: policy.planCode,
            }),
            name: t('site.navLinks.jointOwner.text'),
            hideLabel: false,
            isEligible: manageJointOwnerEligibility?.isEligibleManageJointOwner,
            shouldShow: shouldShowJointOwnerChange,
        },
        {
            href: t('site.navLinks.payor.link', {
                id: policy.policyNumber,
                planCode: policy.planCode,
            }),
            name: t('site.navLinks.payor.text'),
            hideLabel: false,
            isEligible: managePayorEligibility?.isEligibleManagePayor,
            shouldShow: shouldShowPayorChange,
        },
        {
            href: t('site.navLinks.thirdPartyDesignee.link', {
                id: policy.policyNumber,
                planCode: policy.planCode,
            }),
            name: t('site.navLinks.thirdPartyDesignee.text'),
            hideLabel: false,
            isEligible:
                manageThirdPartyDesigneeEligibility?.isEligibleManageThirdPartyDesignee,
            shouldShow: shouldShowThirdPartyDesigneeChange,
        },
        {
            href: t('site.navLinks.beneficiary.link', {
                id: policy.policyNumber,
                planCode: policy.planCode,
            }),
            name: t('site.navLinks.beneficiary.text'),
            hideLabel: false,
            isEligible:
                manageBeneficiaryEligibility?.isEligibleManageBeneficiary,
            shouldShow: shouldShowBeneficiaryChange,
        },
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
                    {t('people.managePeople')}
                    <Icon
                        type={IconType.CHEVRON}
                        height={16}
                        width={16}
                        className="ml-1"
                    />
                </Typography>
            }
        >
            <MenuContextualLabel label={'Manage people'} hideLabel={true}>
                {links
                    .filter((link) => link.shouldShow)
                    .map((link) => {
                        return (
                            <MenuContextualItem
                                content={link.name}
                                href={link.href}
                                key={link.name}
                                openInNewTab={link.isEligible}
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
