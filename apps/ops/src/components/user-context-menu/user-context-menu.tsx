import { useUser } from '@auth0/nextjs-auth0/client';
import { IconType, Icon } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MenuContextual from '@deps/components/menu-contextual/menu-contextual';
import MenuContextualItem from '@deps/components/menu-contextual/menu-contextual-item/menu-contextual-item';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { storage } from '@deps/helpers/sessionStorage.helper';
import { firstNameAndLastInitial } from '@deps/helpers/string.helper';
import { ReactComponent as SignOutIcon } from '@deps/styles/elements/icons/actions/logout.svg';

import styles from './user-context-menu.module.css';

export const UserContextMenu: FC<{ name: string }> = props => {
    const { t } = useTranslation();
    const { user } = useUser();

    const handleAnalytics = () => {
        segmentAnalyticsTrackEvent('navigation_clicked', {
            button_text: t('auth.logout.text'),
            timestamp: new Date().toISOString(),
            userId: user?.partyId,
        });
    };

    return (
        <MenuContextual
            triggerAsChild
            trigger={
                <div className={clsx(styles.contextTrigger, 'typography-content-body color-base-text-text-secondary')}>
                    <Icon className={styles.icon} type={IconType.USER} />
                    <span>{firstNameAndLastInitial(props.name)}</span>
                </div>
            }
        >
            <MenuContextualItem
                replace={true}
                href={t('auth.logout.link') ?? '/api/auth/logout'}
                onClick={() => {
                    // Remove all items from sessionStorage, including cached API responses
                    handleAnalytics();
                    storage.clear();
                }}
                icon={<SignOutIcon height={20} width={20} />}
                content={t('auth.logout.text')}
            />
        </MenuContextual>
    );
};
