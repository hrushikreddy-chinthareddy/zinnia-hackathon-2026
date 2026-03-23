import Image from 'next/image';

import zinniaLogo from '@deps/styles/images/icons/zinnia-logo-small-icon-only.svg';
import zinniaText from '@deps/styles/images/icons/zinnia-logo-small-text-only.svg';

import styles from './Nav.module.css';

export const ZinniaLogo = ({ isExpanded }: { isExpanded: boolean }) => {
    if (isExpanded) {
        return (
            <>
                <Image
                    src={zinniaLogo}
                    alt="Zinnia Logomark"
                    height={24}
                    width={24}
                    aria-hidden="true"
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
        <Image
            src={zinniaLogo}
            alt="Zinnia Logomark"
            height={24}
            width={24}
            aria-hidden="true"
        />
    );
};
