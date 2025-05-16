'use client';
import * as Popover from '@radix-ui/react-popover';
import {
  CarrierAvatars,
  CarrierName,
  Icon,
  IconType,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import EverlyIcon from '@/app/styles/everly/assets/everly-logo-icon-new.svg';
import WellabeIcon from '@/app/styles/wellabe/assets/wellabe-logo-icon.svg';
import { Link } from '@/components/link/Link';
import { UserBadge } from '@/components/user-badge/UserBadge';
import { useFeatureFlags } from '@/hooks/use-feature-flags';
import useMock from '@/hooks/use-mock';
import { CarrierNames } from '@/types/carriers';
import { CarrierListDetail, getCarrierSubdomainByName } from '@/utils/carriers';

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
  [CarrierNames.FARMERS]: CarrierAvatars[CarrierName.FARMERS],
  [CarrierNames.ZINNIA]: CarrierAvatars[CarrierName.ZINNIA],
};

export const NavMenu = ({
  userName,
  carrierPolicyDetails,
}: {
  userName: { firstName?: string; lastName?: string };
  carrierPolicyDetails?: CarrierListDetail[] | null;
}) => {
  const { data: featureFlagData } = useFeatureFlags();
  const [currentUrl, setCurrentUrl] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const { isMockOn } = useMock();

  useEffect(() => {
    if (window) {
      setCurrentUrl(window.location.href);
    }
    // I'm not positive this will reset the currentUrl when a user switches to a different subdomain
  }, [carrierPolicyDetails]);

  if (!featureFlagData) {
    return null;
  }

  return (
    <Popover.Root
      onOpenChange={() => {
        setIsOpen(!isOpen);
      }}
      open={isOpen}
    >
      <Popover.Trigger className={clsx(isMockOn && styles.mockOn)}>
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
            <p className="typography-labels-label-sm">My Coverage</p>
            <ul>
              {carrierPolicyDetails &&
                carrierPolicyDetails.length > 0 &&
                carrierPolicyDetails.map((detail: CarrierListDetail) => {
                  const CarrierIcon =
                    carrierIcons[detail.carrierName as CarrierNames];

                  const companyName = getCarrierSubdomainByName(
                    detail.carrierName
                  );

                  return (
                    <li
                      key={detail.carrierName}
                      className={clsx({
                        [styles.active as string]:
                          // companyName might be an empty string
                          companyName &&
                          currentUrl.includes(companyName) &&
                          pathname === navUrls.allPolicies,
                      })}
                    >
                      <span>
                        {CarrierIcon ? (
                          <CarrierIcon width={20} height={20} color="#ffffff" />
                        ) : (
                          <Icon type={IconType.MATCHES} />
                        )}
                      </span>
                      <Link
                        isInternal
                        href={detail.link.href}
                        aria-label={detail.link.label}
                        onClick={() => {
                          setIsOpen(false);
                        }}
                      >{`${detail.carrierName} ${detail.displayText}`}</Link>
                    </li>
                  );
                })}
            </ul>
            <p className="typography-labels-label-sm">My Account</p>
            <ul>
              <li
                className={clsx({
                  [styles.active as string]: pathname === navUrls.account,
                })}
              >
                <span>
                  <Icon type={IconType.CIRCLE_USER} width={20} height={20} />
                </span>
                <Link
                  isInternal
                  href="/my-account"
                  onClick={() => {
                    setIsOpen(false);
                  }}
                >
                  Account Profile
                </Link>
              </li>
              {/* This is kind of lazy, but because the nav menu is fixed, when i try to remove the bottom
              padding on the container, it is removing the bottom margin on the last li too, i can't
              target this last li without also targeting the last li in the ul above, so i'm just
              explicitly setting the marginBottom here */}
              <li style={{ marginBottom: 0 }}>
                <Link isNativeAnchorTag href="/api/logout">
                  <span>
                    <Icon type={IconType.LOGOUT} width={20} height={20} />
                  </span>
                  Sign out
                </Link>
              </li>
            </ul>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
