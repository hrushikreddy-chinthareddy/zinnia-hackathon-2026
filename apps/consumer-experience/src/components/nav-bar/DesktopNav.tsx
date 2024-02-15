import { Icon, IconType } from '@zdx/bloom/components';
import Link from 'next/link';

import LogoImage from '@/app/styles/everly/everly-logo.svg';
import styles from './NavBar.module.css';

export function DesktopNav() {
  return (
    <div className={styles.container}>
      <Link href="/" className="justify-self-start">
        <LogoImage alt="Company Logo" className={styles.logo}></LogoImage>
      </Link>

      <div className={`${styles.navItemsContainer} typography-nav-links-sm`}>
        <Link href="#" className={styles.navItem}>
          <Icon type={IconType.DOCUMENT_TEXT} />
          Documents
        </Link>
        <Link href="/profile" className={styles.navItem}>
          <Icon type={IconType.CIRCLE_USER} />
          Profile
        </Link>
        <span aria-hidden className={styles.separator}>
          |
        </span>
        <a href="/api/auth/logout">Sign out</a>
      </div>
    </div>
  );
}
