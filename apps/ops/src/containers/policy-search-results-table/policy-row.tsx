import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Icon,
    IconType,
    TableCell,
    TableRow,
    Tooltip,
    TooltipPlacement,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
    getBadgeStatus,
    getBadgeStatusVariant,
} from '@deps/components/badge/badge.helpers';
import { getPolicyBadgeStatusTooltip } from '@deps/components/global-values/global-values-bar/global-values-helpers';
import { PolicyBadgeStatus } from '@deps/components/global-values/policy-info/policy-info';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { isEndDated } from '@deps/helpers/date.helpers';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { convertToQueryString } from '@deps/helpers/routing.helpers';
import { formatSSN } from '@deps/helpers/string.helpers';
import { UserPermission } from '@deps/models/user-profile';
import { getCasesQuery } from '@deps/queries/tanstack/caseQueries/caseQueries';
import { hasPermissionQuery } from '@deps/queries/tanstack/permissionsQueries/permissions-queries';
import {
    getPolicyQueryKey,
    getPolicyQuery,
} from '@deps/queries/tanstack/policyQueries/policyQueries';
import {
    DEFAULT_DATE_FORMAT,
    DEFAULT_ERROR_STRING,
    FIFTEEN_MINUTES_IN_MS,
    FIVE_MINUTES_IN_MS,
} from '@deps/types/constants';
import { PolicySearchResult } from '@deps/types/search';
import {
    getCarrierLogoByClientId,
    getCarrierNameByClientId,
} from '@deps/utils/carriers';
import { toSentenceCase } from '@deps/utils/strings';
import { PartyRole, PolicyStatus } from '@zinnia/api-types/types/sor';

import { PolicyActionCell } from './policy-action-cell';
import styles from './policy-row.module.css';
interface PolicyRowProps {
    item: PolicySearchResult;
}

export const PolicyRow: FC<PolicyRowProps> = ({ item }) => {
    const queryClient = useQueryClient();
    const { partyId } = usePermissionsContext();
    const { featureFlags } = useOptimizely();
    const { t } = useTranslation();

    const { data: policyData, isLoading: isPolicyDataLoading } = useQuery({
        queryKey: [getPolicyQueryKey, item.policyNumber, item.planCode],
        queryFn: () => getPolicyQuery(item.policyNumber, item.planCode),
        staleTime: FIVE_MINUTES_IN_MS, //TODO: Do we want to cache this? For how long?
    });

    const { data: caseData, isLoading: isCaseDateLoading } = useQuery({
        queryKey: ['caseData', item.policyNumber, featureFlags],
        queryFn: () => getCasesQuery(item.policyNumber, featureFlags),
        placeholderData: (previousData) => previousData,
    });

    queryClient.prefetchQuery({
        queryKey: ['canEditPolicy', item.policyNumber, item.planCode, partyId],
        queryFn: () =>
            hasPermissionQuery(
                UserPermission.AllowEditPolicy,
                `policy:${item.policyNumber}_${item.planCode}`,
                partyId
            ),
        staleTime: FIFTEEN_MINUTES_IN_MS,
    });

    const hasCases = useMemo(() => {
        return caseData && 'total' in caseData && caseData.total > 0;
    }, [caseData]);

    // Prefer 'Full Name' for the policy owner.
    // Enterprise search doesnt return full name, so we use it from policyData first
    // and fall back to policy search first name/last name values
    const policyOwner = useMemo(() => {
        // get policy owner id
        const policyOwnerId = policyData?.partyRoles?.find(
            (pr) => pr.partyRole === PartyRole.OWNER && !isEndDated(pr.endDate)
        )?.partyId;

        //use ID to find the policy owner data
        const policyOwner = policyData?.parties?.find(
            (party) => party.partyId === policyOwnerId
        );

        if (policyOwner) {
            if (policyOwner?.fullName) {
                return toSentenceCase(policyOwner.fullName);
            } else {
                return `${toSentenceCase(item.firstName)} ${toSentenceCase(
                    item.lastName
                )}`;
            }
        } else {
            return undefined;
        }
    }, [item.firstName, item.lastName, policyData]);

    const policyDetails = policyData ? new PolicyDetails(policyData) : null;

    const imageSrc = getCarrierLogoByClientId(item.carrierId);
    const carrierName = getCarrierNameByClientId(item.carrierId);

    return (
        <TableRow
            key={`${item.policyNumber}-${item.planCode}`}
            className="relative"
        >
            <TableCell className={styles.policyLinkContainer}>
                <Link
                    href={`/policies/${item.planCode}/${item.policyNumber}/policy/policy-details`}
                    className={styles.policyLink}
                ></Link>
            </TableCell>
            <TableCell>
                <div className={styles.productCell}>
                    <Tooltip
                        placement={TooltipPlacement.TopRight}
                        tooltipClassName="!w-auto"
                        triggerClassName="!z-10"
                        trigger={
                            <div className={styles.carrierImage}>
                                <Image
                                    src={imageSrc}
                                    alt={`${carrierName} icon`}
                                    role="presentation"
                                    height={14}
                                    width={14}
                                />
                                <span className="sr-only">
                                    {carrierName} icon
                                </span>
                            </div>
                        }
                    >
                        {carrierName}
                    </Tooltip>
                    <div>
                        <p>{item.productName}</p>
                        <p>{item.policyNumber}</p>
                    </div>
                </div>
            </TableCell>
            <TableCell className={clsx(isPolicyDataLoading && styles.loading)}>
                <PolicyBadgeStatus
                    status={
                        (t(
                            getBadgeStatus(policyData?.policyStatus)
                        ) as PolicyStatus) || undefined
                    }
                    variant={getBadgeStatusVariant(
                        policyData?.policyStatus as PolicyStatus
                    )}
                    tooltip={getPolicyBadgeStatusTooltip(
                        policyData?.policyStatus as PolicyStatus
                    )}
                />
            </TableCell>
            <TableCell>
                {policyOwner ? (
                    <>
                        <PiiWrapper className={styles.ownerCell}>
                            {policyOwner}
                        </PiiWrapper>
                        <PiiWrapper className="typography-content-body-sm text-[--color-base-text-text-secondary] block">
                            {formatSSN(item.ssn)}
                        </PiiWrapper>
                    </>
                ) : (
                    <span className={styles.noCases}>
                        {DEFAULT_ERROR_STRING}
                    </span>
                )}
            </TableCell>
            {/* Case Table Cell */}
            <TableCell
                className={clsx([
                    isCaseDateLoading && styles.loading,
                    styles.caseCell,
                ])}
            >
                {hasCases ? (
                    <Link
                        aria-label={`View Cases for policy ${item.policyNumber}`}
                        className={styles.casesCount}
                        href={`/cases${convertToQueryString({
                            policyNumber: item.policyNumber || '',
                        })}`}
                        target="_blank"
                    >
                        <Icon
                            type={IconType.CIRCLE_INFO}
                            className={styles.infoIcon}
                        />
                        {caseData && 'total' in caseData && caseData?.total}
                    </Link>
                ) : (
                    <span className={styles.noCases}>
                        {DEFAULT_ERROR_STRING}
                    </span>
                )}
            </TableCell>
            {/* End Case Table Cell */}
            <TableCell>
                {dayjs(item.lastUpdated).format(DEFAULT_DATE_FORMAT)}
            </TableCell>
            {policyDetails?.isTPA && (
                <TableCell className={styles.actionsCell}>
                    <PolicyActionCell
                        policyNumber={item.policyNumber}
                        planCode={item.planCode}
                    />
                </TableCell>
            )}
        </TableRow>
    );
};
