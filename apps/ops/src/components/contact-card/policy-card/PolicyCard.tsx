import { useQuery } from '@tanstack/react-query';
import { Icon, IconType } from '@zinnia/bloom/components';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';

import { getBadgeStatus } from '@deps/components/badge/badge.helpers';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { mapProductTypeToTranslation } from '@deps/helpers/translation.helpers';
import { getTimeAgoUnitValue } from '@deps/hooks/useStatusInfo';
import { getPolicyQuery } from '@deps/queries/tanstack/policyQueries/policyQueries';
import { PolicySearchResult } from '@deps/types/search';
import { getCarrierLogoByClientId } from '@deps/utils/carriers';
import { toSentenceCase } from '@deps/utils/strings';
import { PolicyStatus } from '@zinnia/api-types/types/sor';

import styles from './PolicyCard.module.css';

export default function PolicyCard({
    policy,
    ...rest
}: { policy: PolicySearchResult } & React.HTMLAttributes<HTMLLIElement>) {
    const { t } = useTranslation();
    const { unit, count } = getTimeAgoUnitValue(policy.lastUpdated) || {};
    const { data: coverage } = useQuery({
        queryKey: ['policy', policy.policyNumber, policy.planCode],
        queryFn: () => getPolicyQuery(policy.policyNumber, policy.planCode),
        select: (policy) => {
            const details = new PolicyDetails(policy);
            return details.coverage.baseDeathBenefit;
        },
    });

    return (
        <li {...rest} className={styles.policyCard}>
            <div className={styles.policyCardContainer}>
                <div className={styles.policyCardInfo}>
                    <Image
                        alt={policy.carrierId}
                        width={48}
                        height={48}
                        src={getCarrierLogoByClientId(policy.carrierId)}
                        className={styles.carrierLogo}
                    />
                    <div className={styles.policyCardInfoText}>
                        <span className="typography-labels-field-label">
                            <Icon
                                type={IconType.SHIELD_CHECKMARK}
                                height={16}
                                width={16}
                            />
                            {t(
                                getBadgeStatus(
                                    policy.policyStatus as PolicyStatus
                                )
                            )}
                            :{' '}
                            {
                                mapProductTypeToTranslation(
                                    policy.productType,
                                    t
                                ).acronym
                            }{' '}
                            #{policy.policyNumber}
                        </span>
                        <span className="typography-labels-label-lg-alt">
                            {policy.productName}
                        </span>
                    </div>
                </div>
                <div className={styles.policyCardRightSide}>
                    <div className={styles.policyCardRightSideInfo}>
                        <span className="typography-content-body-sm">
                            {t('contacts.coverage')}:{' '}
                            {numberFormatify(coverage, {
                                style: 'currency',
                                currency: 'USD',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                            })}
                        </span>
                        <span
                            className={`typography-labels-label-sm-alt ${styles.timeAgo}`}
                        >
                            {toSentenceCase(t('contacts.updated'))}{' '}
                            {t('temporal.timeago', {
                                count,
                                unit,
                                formattedDate: null,
                            })}
                        </span>
                    </div>
                    <Icon
                        type={IconType.CHEVRON_RIGHT}
                        height={16}
                        width={16}
                        className={`${styles.icon} text-secondary`}
                    />
                </div>
            </div>
        </li>
    );
}
