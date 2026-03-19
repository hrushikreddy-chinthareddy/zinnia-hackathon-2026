import {
    CarrierAvatar,
    CarrierName,
    Icon,
    IconType,
} from '@zinnia/bloom/components';

import styles from './Nav.module.css';
import { ZinniaLogo } from './ZinniaLogo';
export const CollapsedLogo = ({
    activeCarrier,
    handleLogoClick,
    isExpanded,
    expandText,
}: {
    activeCarrier: CarrierName;
    handleLogoClick: () => void;
    isExpanded: boolean;
    expandText: string;
}) => {
    if (activeCarrier && activeCarrier !== CarrierName.ZINNIA) {
        return (
            <button
                className={styles.logoButton}
                onClick={handleLogoClick}
                aria-label={expandText}
                disabled={isExpanded}
                tabIndex={0}
            >
                <Icon
                    className={styles.logoButton__expandIcon}
                    type={IconType.NAV_DISPLAY_CONTROL}
                    height={16}
                    width={16}
                    alt="Expand"
                />
                <CarrierAvatar
                    carrier={activeCarrier}
                    alt={`${activeCarrier} Logo`}
                    height={20}
                    width={20}
                    className={`${styles.carrierLogo} ${styles.logoButton__logo}`}
                />
            </button>
        );
    }

    return (
        <ZinniaLogo
            handleLogoClick={handleLogoClick}
            isExpanded={isExpanded}
            expandText={expandText}
        />
    );
};
