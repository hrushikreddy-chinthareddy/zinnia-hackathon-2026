'use client';

import { Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useFeatureFlags } from '@/hooks/use-feature-flags';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import styles from './NavMenu.module.css';

const navUrls = {
  account: '/my-account',
  allPolicies: '/coverage',
};

export const NavMenu = () => {
  const { data: featureFlagData } = useFeatureFlags();
  const showAnnuities = featureFlagData?.[FEATURE_FLAGS.ANNUITY_MODE];
  const pathname = usePathname();

  if (!featureFlagData) {
    return null;
  }

  return (
    <div className={styles.navList}>
      <ul>
        <li
          className={clsx({
            [styles.active as string]: pathname === navUrls.account,
          })}
        >
          <Icon type={IconType.CIRCLE_USER} />
          <Link href="/my-account">Account profile</Link>
        </li>
        {!showAnnuities && (
          <li
            className={clsx({
              [styles.active as string]: pathname === navUrls.allPolicies,
            })}
          >
            <Icon type={IconType.MATCHES} />
            <Link href="/coverage">My policies</Link>
          </li>
        )}
        {/* TODO: add logic to show different carriers with product counts */}
      </ul>
      <div style={{ position: 'relative' }}>
        <Link href="api/logout">
          <Icon type={IconType.LOGOUT} />
          <span>Sign out</span>
        </Link>
      </div>
    </div>
  );
};
