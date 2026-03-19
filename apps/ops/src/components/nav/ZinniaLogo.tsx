import { Icon, IconType } from '@zinnia/bloom/components';
import Image from 'next/image';

import zinniaLogo from '@deps/styles/images/icons/zinnia-logo-small-icon-only.svg';
import zinniaText from '@deps/styles/images/icons/zinnia-logo-small-text-only.svg';

import styles from './Nav.module.css';

export const ZinniaLogo = ({
    handleLogoClick,
    isExpanded,
    expandText,
}: {
    handleLogoClick: () => void;
    isExpanded: boolean;
    expandText: string;
}) => {
    if (isExpanded) {
        return (
            <>
                <Image
                    src={zinniaLogo}
                    alt="Zinnia Logomark"
                    height={24}
                    width={24}
                />
                <Image
                    className={styles.logoText}
                    src={zinniaText}
                    alt="Zinnia Logo"
                    height={24}
                    width={66}
                />
            </>
        );
    }
    return (
        <button
            className={styles.logoButton}
            onClick={handleLogoClick}
            aria-label={expandText}
            tabIndex={0}
        >
            <Icon
                className={styles.logoButton__expandIcon}
                type={IconType.NAV_DISPLAY_CONTROL}
                height={16}
                width={16}
                alt="Expand"
            />
            <Image
                className={styles.logoButton__logo}
                src={zinniaLogo}
                alt="Zinnia Logomark"
                height={24}
                width={24}
            />
        </button>
    );
};
