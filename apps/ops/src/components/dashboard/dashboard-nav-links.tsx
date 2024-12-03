import { IconType, Link } from '@zinnia/bloom/components';
import { toTitleCase } from '@zinnia/utils';
import { clsx } from 'clsx';
import { useRouter } from 'next/router';

import { default as styles } from '@deps/pages/dashboard/Dashboard.module.css';

export const DashboardNavLinks = () => {
    const router = useRouter();
    return (
        <nav className="flex basis-full no-wrap gap-4 bg-white px-8 pt-4 pb-0">
            <Link
                iconType={IconType.DOCUMENT_TEXT}
                href="/dashboard"
                text={toTitleCase('active applications')}
                style={{ paddingBottom: 'var(--measure-dimension-padding-lg)' }}
                className={clsx(
                    'border-b-4',
                    'overflow-visible',
                    styles.link,
                    router.pathname === '/dashboard'
                        ? 'border-[--color-base-border-border-secondary-color]'
                        : 'border-transparent !text-[--color-base-text-text-secondary]'
                )}
            />
            <Link
                iconType={IconType.SHIELD_CHECKMARK}
                href="/dashboard/issued-business"
                text={toTitleCase('issued business')}
                style={{ paddingBottom: 'var(--measure-dimension-padding-lg)' }}
                className={clsx(
                    'border-b-4',
                    'overflow-visible',
                    styles.link,
                    router.pathname === '/dashboard/issued-business'
                        ? 'border-[--color-base-border-border-secondary-color]'
                        : 'border-transparent !text-[--color-base-text-text-secondary]'
                )}
            />
        </nav>
    );
};
