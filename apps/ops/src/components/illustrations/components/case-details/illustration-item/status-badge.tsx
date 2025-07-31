import { Badge, BadgeVariant, Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';

import {
    IllustrationStatus,
    IllustrationStatuses,
} from '@deps/types/illustrations';

import styles from './status-badge.module.css';

interface StatusBadgeProps {
    status?: IllustrationStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
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
                        label="Selected"
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
                        label="Archived"
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
                        label="Expired"
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
