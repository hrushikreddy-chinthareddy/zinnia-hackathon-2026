import { useUser } from '@auth0/nextjs-auth0/client';
import { CarrierName, Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MenuContextual from '@deps/components/menu-contextual/menu-contextual';
import MenuContextualItem from '@deps/components/menu-contextual/menu-contextual-item/menu-contextual-item';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { storage } from '@deps/helpers/sessionStorage.helpers';
import { firstNameAndLastInitial } from '@deps/helpers/string.helpers';
import { useTheme } from '@deps/hooks/useTheme';

import styles from './user-context-menu.module.css';

export const UserContextMenu: FC<{ name: string }> = (props) => {
    const { t } = useTranslation();
    const { user } = useUser();
    const { carrierName: role } = useTheme();
    const apexUrl = process.env.NEXT_PUBLIC_APEX_URL;
    const { showCommissions } = usePermissionsContext();

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
            role=""
            triggerAsChild
            trigger={
                <button
                    aria-label={
                        t('allFields.navLinksUserMenuFor', {
                            name: props.name,
                        }) as string
                    }
                    className={clsx(
                        styles.contextTrigger,
                        'typography-content-body color-base-text-secondary'
                    )}
                >
                    <Icon className={styles.icon} type={IconType.USER} />
                    <span className={styles.name}>
                        {firstNameAndLastInitial(props.name)}
                    </span>
                </button>
            }
        >
            {role === CarrierName.FARMERS && (
                <MenuContextualItem
                    content={t('auth.apexLink.text') as string}
                    href={apexUrl}
                    icon={<Icon type={IconType.REPLY} width={20} height={20} />}
                    onClick={handleAnalytics}
                />
            )}

            {showCommissions && (
                <MenuContextualItem
                    content={t('site.navLinks.commissions.text') as string}
                    href={
                        t('site.navLinks.commissions.link') ??
                        '/commissions/statements'
                    }
                    icon={
                        <Icon
                            type={IconType.DOCUMENT_REPORT}
                            width={20}
                            height={20}
                        />
                    }
                    onClick={handleAnalytics}
                />
            )}
            <MenuContextualItem
                content={t('auth.logout.text') as string}
                data-testid="sign-out-link"
                href={t('auth.logout.link') ?? '/api/auth/logout'}
                icon={<Icon type={IconType.LOGOUT} width={20} height={20} />}
                onClick={handleAnalytics}
            />
        </MenuContextual>
    );
};
