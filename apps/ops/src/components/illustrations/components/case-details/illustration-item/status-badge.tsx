import { Badge, BadgeVariant, Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';

import { TranslationFiles } from '@deps/config/translations';
import {
    IllustrationStatus,
    IllustrationStatuses,
} from '@deps/types/illustrations';

import styles from './status-badge.module.css';

interface StatusBadgeProps {
    status?: IllustrationStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {});

    switch (status) {
        case IllustrationStatuses.SUBMITTED:
        case IllustrationStatuses.SELECTED:
            return (
                <span className={clsx(styles.iconBadge)}>
                    <Icon
                        type={IconType.CIRCLE_CHECKMARK}
                        className={clsx(styles.icon, styles.submitted)}
                        width={18}
                        height={18}
                        aria-hidde={true}
                    />
                    <Badge
                        label={
                            t(
                                'clientCase.illustrationDetails.selected'
                            ) as string
                        }
                        variant={BadgeVariant.SUCCESS}
                        style={{ paddingLeft: '1.75rem' }}
                    />
                </span>
            );
        case IllustrationStatuses.ARCHIVED:
            return (
                <span className={clsx(styles.iconBadge)}>
                    <Icon
                        type={IconType.FOLDER}
                        className={clsx(styles.icon, styles.archived)}
                        width={18}
                        height={18}
                        aria-hidde={true}
                    />
                    <Badge
                        label={
                            t(
                                'clientCase.illustrationDetails.archived'
                            ) as string
                        }
                        variant={BadgeVariant.INACTIVE}
                        style={{ paddingLeft: '1.75rem' }}
                    />
                </span>
            );
        case IllustrationStatuses.EXPIRED:
            return (
                <span className={clsx(styles.iconBadge)}>
                    <Icon
                        type={IconType.CLOCK}
                        className={clsx(styles.icon, styles.expired)}
                        width={18}
                        height={18}
                        aria-hidde={true}
                    />
                    <Badge
                        label={
                            t(
                                'clientCase.illustrationDetails.expired'
                            ) as string
                        }
                        variant={BadgeVariant.ERROR}
                        style={{ paddingLeft: '1.75rem' }}
                    />
                </span>
            );
        default:
            null;
    }
};

export default StatusBadge;
