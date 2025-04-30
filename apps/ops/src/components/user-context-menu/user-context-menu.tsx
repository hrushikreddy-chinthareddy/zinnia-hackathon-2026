import { useUser } from '@auth0/nextjs-auth0/client';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { IconType, Icon } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MenuContextual from '@deps/components/menu-contextual/menu-contextual';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { storage } from '@deps/helpers/sessionStorage.helper';
import { firstNameAndLastInitial } from '@deps/helpers/string.helper';

import styles from './user-context-menu.module.css';

export const UserContextMenu: FC<{ name: string }> = props => {
    const { t } = useTranslation();
    const { user } = useUser();

    const handleAnalytics = () => {
        storage.clear();
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
            <DropdownMenu.Item onSelect={handleAnalytics}>
                <a
                    className={
                        'default-focus flex items-center gap-2 self-stretch rounded-sm px-4 py-0 text-white hover:bg-gray-800 active:bg-white active:text-gray-900'
                    }
                    href={t('auth.logout.link') ?? '/api/auth/logout'}
                >
                    <Icon type={IconType.LOGOUT} width={20} height={20} />
                    {t('auth.logout.text')}
                </a>
            </DropdownMenu.Item>
        </MenuContextual>
    );
};
