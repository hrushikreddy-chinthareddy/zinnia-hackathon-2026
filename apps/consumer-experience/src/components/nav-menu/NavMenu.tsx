'use client';
import * as Popover from '@radix-ui/react-popover';
import { Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import EverlyIcon from '@/app/styles/everly/assets/everly-logo-icon.svg';
import WellabeIcon from '@/app/styles/wellabe/assets/wellabe-logo-icon.svg';
import { UserBadge } from '@/components/user-badge/UserBadge';
import { useFeatureFlags } from '@/hooks/use-feature-flags';
import useMock from '@/hooks/use-mock';
import { CarrierNames } from '@/types/carriers';
import { CarrierListDetail } from '@/utils/carriers';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import styles from './NavMenu.module.css';

const navUrls = {
  account: '/my-account',
  allPolicies: '/coverage',
};

const carrierIcons: Record<
  CarrierNames,
  React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  > | null
> = {
  [CarrierNames.EVERLY]: EverlyIcon,
  [CarrierNames.WELLABE]: WellabeIcon,
};

export const NavMenu = ({
  userName,
  carrierPolicyDetails,
}: {
  userName: { firstName?: string; lastName?: string };
  carrierPolicyDetails?: CarrierListDetail[] | null;
}) => {
  const { data: featureFlagData } = useFeatureFlags();
  const showAnnuities = featureFlagData?.[FEATURE_FLAGS.ANNUITY_MODE];
  const [currentUrl, setCurrentUrl] = useState('');
  const pathname = usePathname();
  const { isMockOn } = useMock();

  useEffect(() => {
    if (window) {
      setCurrentUrl(window.location.href);
    }
  }, [carrierPolicyDetails]);

  if (!featureFlagData) {
    return null;
  }

  return (
    <Popover.Root>
      <Popover.Trigger
        className={clsx({ [styles.mockOn as string]: isMockOn })}
      >
        <UserBadge
          firstName={userName?.firstName}
          lastName={userName?.lastName}
        />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className={styles.navMenuContainer}
          sideOffset={10}
          align="end"
        >
          <div className="typography-nav-nav-drawer">
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

              {carrierPolicyDetails &&
                carrierPolicyDetails.length &&
                carrierPolicyDetails.map((detail: CarrierListDetail) => {
                  const CarrierIcon =
                    carrierIcons[detail.carrierName as CarrierNames];

                  return (
                    <li
                      key={detail.carrierName}
                      className={clsx({
                        [styles.active as string]:
                          pathname === navUrls.allPolicies &&
                          currentUrl.includes(detail.carrierName.toLowerCase()),
                      })}
                    >
                      {CarrierIcon ? (
                        <CarrierIcon width={16} height={16} />
                      ) : (
                        <Icon type={IconType.MATCHES} />
                      )}
                      <Link href="/coverage">{`${detail.carrierName} ${detail.displayText}`}</Link>
                    </li>
                  );
                })}
            </ul>
            <div style={{ position: 'relative' }}>
              <a href="/api/logout">
                <Icon type={IconType.LOGOUT} />
                <span>Sign out</span>
              </a>
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
