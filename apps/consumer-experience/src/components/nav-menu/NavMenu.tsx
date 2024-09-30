'use client';

import { IconType, Link } from '@zinnia/bloom/components';

import styles from './NavMenu.module.css';
import { useFeatureFlags } from '@/hooks/use-feature-flags';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';
import { usePathname } from 'next/navigation';

export const NavMenu = () => {
  const { data: featureFlagData } = useFeatureFlags();
  const showAnnuities = featureFlagData?.[FEATURE_FLAGS.ANNUITIES_MODE];
  const pathname = usePathname();

  console.log('pathname', pathname);

  return (
    <div className={styles.navList}>
      <ul>
        <li>
          <Link
            iconType={IconType.CIRCLE_USER}
            href="/my-account"
            text="Account profile"
          />
        </li>
        {!showAnnuities && (
          <li>
            <Link
              iconType={IconType.MATCHES}
              href="/coverage"
              text="My policies"
            />
          </li>
        )}
        {/* TODO: add logic to show different carriers with product counts */}
      </ul>
      <Link iconType={IconType.LOGOUT} href="api/logout" text="Sign out" />
    </div>
  );
};
