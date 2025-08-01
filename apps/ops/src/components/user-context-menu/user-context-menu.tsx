import { useUser } from '@auth0/nextjs-auth0/client';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { IconType, Icon, CarrierName } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { getCookie } from 'cookies-next';
import Link from 'next/link';
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import MenuContextual from '@deps/components/menu-contextual/menu-contextual';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { storage } from '@deps/helpers/sessionStorage.helpers';
import { firstNameAndLastInitial } from '@deps/helpers/string.helpers';

import styles from './user-context-menu.module.css';

export const UserContextMenu: FC<{ name: string }> = (props) => {
    const { t } = useTranslation();
    const { user } = useUser();
    const [role, setRole] = useState<CarrierName>(CarrierName.ZINNIA);
    const apexUrl = process.env.NEXT_PUBLIC_APEX_URL;
    const { showCommissions } = usePermissionsContext();

    useEffect(() => {
        const cookie = getCookie('role') as string | undefined;
        if (cookie == 'farmers') {
            setRole(CarrierName.FARMERS);
        }
    }, []);

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
                <div
                    className={clsx(
                        styles.contextTrigger,
                        'typography-content-body color-base-text-text-secondary'
                    )}
                >
                    <Icon className={styles.icon} type={IconType.USER} />
                    <span>{firstNameAndLastInitial(props.name)}</span>
                </div>
            }
        >
            {role === CarrierName.FARMERS && (
                <DropdownMenu.Item
                    onSelect={handleAnalytics}
                    className="w-full"
                >
                    <a
                        className={
                            'default-focus flex items-center gap-2 self-stretch rounded-sm px-4 py-2 text-white hover:bg-gray-800 active:bg-white active:text-gray-900 z-10 text-nowrap w-full'
                        }
                        href={apexUrl}
                    >
                        <Icon type={IconType.REPLY} width={20} height={20} />
                        {t('auth.apexLink.text')}
                    </a>
                </DropdownMenu.Item>
            )}

            {showCommissions && (
                <DropdownMenu.Item
                    onSelect={handleAnalytics}
                    className="w-full"
                >
                    <Link
                        className={
                            'default-focus flex items-center gap-2 rounded-sm px-4 text-white hover:bg-gray-800 active:bg-white active:text-gray-900 z-10 w-full text-nowrap'
                        }
                        href={
                            t('site.navLinks.commissions.link') ??
                            '/commissions/statements'
                        }
                    >
                        <Icon
                            type={IconType.DOCUMENT_REPORT}
                            width={20}
                            height={20}
                        />
                        {t('site.navLinks.commissions.text')}
                    </Link>
                </DropdownMenu.Item>
            )}
            <DropdownMenu.Item onSelect={handleAnalytics} className="w-full">
                <a
                    className="default-focus flex items-center gap-2 rounded-sm px-4 py-2 text-white hover:bg-gray-800 active:bg-white active:text-gray-900 z-10 w-full text-nowrap"
                    href={t('auth.logout.link') ?? '/api/auth/logout'}
                >
                    <Icon type={IconType.LOGOUT} width={20} height={20} />
                    {t('auth.logout.text')}
                </a>
            </DropdownMenu.Item>
        </MenuContextual>
    );
};
