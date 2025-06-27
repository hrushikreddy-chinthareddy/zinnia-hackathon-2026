import { Icon, TabTrigger, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';

import { default as styles } from './TabTitle.module.css';

export const TabTitle = ({
    value,
    icon,
    label,
}: {
    value: string;
    icon: IconType;
    label: string;
}) => {
    return (
        <TabTrigger value={value}>
            <div className={clsx(styles.tabTitle)}>
                <Icon type={icon} />
                {label}
            </div>
        </TabTrigger>
    );
};
