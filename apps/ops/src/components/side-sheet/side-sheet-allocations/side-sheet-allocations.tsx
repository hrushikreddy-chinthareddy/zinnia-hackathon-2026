import { PartyRole, Policy } from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import Button, { ButtonSize, ButtonType } from '@deps/components/button/button';
import CardInfo from '@deps/components/card/card-info/card-info';
import NavElement, {
    NavElementSize,
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import CardContainer from '@deps/containers/card-container/card-container';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import BeneficiaryAllocator from './beneficiary-allocator';
import {
    AllocationPercentage,
    Beneficiary,
    beneficiaryRoles,
    buildBeneficiaryAllocation,
    determinePartyBeneficiaryRole,
    getBeneficiariesByRole,
    PartyId,
} from './side-sheet-allocations-helpers';

interface SideSheetAllocationsProps {
    focusedPartyId?: PartyId;
    handleClose: () => void;
    policy: Policy;
    refreshPolicy: () => void;
}

interface RoleBeneficiaries {
    [key: string]: Beneficiary[];
}

const SideSheetAllocations = ({
    focusedPartyId,
    handleClose,
    policy,
    refreshPolicy,
}: SideSheetAllocationsProps) => {
    const { t } = useTranslation();

    const [benefitPercentages, setBenefitPercentages] = useState({
        [PartyRole.PRIMARYBENEFICIARY]: [] as AllocationPercentage[],
        [PartyRole.CONTINGENTBENEFICIARY]: [] as AllocationPercentage[],
    });
    const [shouldValidate, setShouldValidate] = useState(false);
    const [validTotals, setValidTotals] = useState({
        [PartyRole.PRIMARYBENEFICIARY]: false,
        [PartyRole.CONTINGENTBENEFICIARY]: false,
    });
    const [status, setStatus] = useState({
        success: false,
        loading: false,
        error: false,
    });

    const goodToSubmit = (
        isRoleValid: { [key: string]: boolean },
        rolesToCheck: (PartyRole | undefined)[] | undefined
    ) => {
        return rolesToCheck?.reduce(
            (acc: boolean, role) => acc && isRoleValid[role as string],
            true
        );
    };

    const handleBeneficiaryChange =
        (role: PartyRole | undefined) =>
        (percentages: AllocationPercentage[], isValid: boolean) => {
            setValidTotals((prev) => {
                return { ...prev, [role as string]: isValid };
            });
            setBenefitPercentages((prev) => {
                return { ...prev, [role as string]: percentages };
            });
        };

    // If a partyID for a beneficiary role was passed in props, allocate for that partyID's role.  Otherwise, allocate for all beneficiary roles that have a party with that role
    const determineRolesToAllocate = () => {
        if (focusedPartyId) {
            const roleToAllocate = determinePartyBeneficiaryRole(
                policy.partyRoles,
                focusedPartyId
            );
            if (roleToAllocate) {
                return [roleToAllocate];
            }
        }
        const allPartyRoles = policy?.partyRoles?.map(
            (party) => party.partyRole
        );
        return beneficiaryRoles.filter((role) => {
            return allPartyRoles?.includes(role);
        });
    };

    useEffect(() => {
        status.success && refreshPolicy();
    }, [status.success]);

    const rolesToAllocate = determineRolesToAllocate();

    const beneficiariesByRole = rolesToAllocate.reduce((acc, role) => {
        acc[role as string] = getBeneficiariesByRole(
            policy,
            role
        ) as Beneficiary[];
        return acc;
    }, {} as RoleBeneficiaries);

    const onSubmit = async () => {
        setShouldValidate(true);

        if (!goodToSubmit(validTotals, rolesToAllocate)) {
            return;
        }

        const beneficiaryAllocation = buildBeneficiaryAllocation(
            benefitPercentages,
            rolesToAllocate
        );
        // API requires a partyID to update beneficiaries.
        // If one isn't provided, grab the first one available from allocations
        // NOTE: Grabbing the first one works because we're not adding or removing allocations.
        // If we end up having to do that, will need to revisit this piece with the API team
        const partyIdForRoute =
            focusedPartyId || beneficiaryAllocation[0].partyPolicyId;
        const url = `/api/policy/v1/policies/${policy.policyNumber}/parties/${partyIdForRoute}/beneficiary`;
        const startDate = dayjs().format(ZAHARA_API_DATE_FORMAT);
        setStatus({ ...status, loading: true });

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    beneficiaryAllocation,
                    startDate,
                }),
            });

            if (response.ok) {
                setStatus({ ...status, success: true, loading: false });
            } else {
                console.error('Error:', response.status);
                setStatus({ ...status, error: true, loading: false });
            }
        } catch (e) {
            setStatus({ ...status, error: true, loading: false });
        }
    };

    if (status.success) {
        const closeAndRefresh = () => {
            handleClose();
        };

        return (
            <CardInfo
                icon={
                    <CircleCheckIcon
                        className="text-semantic-success"
                        height={50}
                        width={50}
                    />
                }
                title={t('general.successExclamation')}
                subtitle={t(
                    'sideSheet.allocation.beneficiaryAllocationsWereUpdated'
                )}
                className="mt-8"
                cta={{ action: closeAndRefresh, text: t('general.close') }}
            />
        );
    }

    if (status.loading)
        return (
            <div className="p-8">
                <PageLoader variant={PageLoaderVariant.Center} />
            </div>
        );

    return (
        <CardContainer classNames="w-full">
            {rolesToAllocate.map((roleToAllocate, index) => (
                <BeneficiaryAllocator
                    beneficiaries={
                        beneficiariesByRole[roleToAllocate as string]
                    }
                    className={index ? 'border-t-2 border-gray-100' : ''}
                    key={`beneficiary-allocator-${roleToAllocate}`}
                    needsValidation={shouldValidate}
                    onChange={handleBeneficiaryChange(roleToAllocate)}
                    focusedPartyId={focusedPartyId}
                    partyRole={roleToAllocate}
                />
            ))}
            <div className="mt-4 flex gap-6">
                <Button
                    onClick={onSubmit}
                    size={ButtonSize.Small}
                    type={ButtonType.Primary}
                >
                    {t('sideSheet.allocation.updateAllocations')}
                </Button>
                <NavElement
                    aria-label={t('sideSheet.allocation.cancel') as string}
                    type={NavElementType.Button}
                    size={NavElementSize.Small}
                    variant={NavElementVariant.Default}
                    onClick={handleClose}
                >
                    {t('sideSheet.allocation.cancel')}
                </NavElement>
            </div>
        </CardContainer>
    );
};
export default SideSheetAllocations;
