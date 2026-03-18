import {
    CarrierAvatar,
    CarrierName,
    Icon,
    IconType,
} from '@zinnia/bloom/components';
import { useState } from 'react';

import { useDebounce } from '@deps/hooks/useDebounce';

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
    const [isInteractive, setIsInteractive] = useState(false);
    const debounceInteractive = useDebounce(isInteractive, 200);
    if (activeCarrier && activeCarrier !== CarrierName.ZINNIA) {
        return (
            <button
                className={styles.logoButton}
                onClick={() => {
                    handleLogoClick();
                    setIsInteractive(false);
                }}
                aria-label={isExpanded ? `${activeCarrier} Logo` : expandText}
                disabled={isExpanded}
                tabIndex={isExpanded ? -1 : 0}
                onMouseEnter={() => setIsInteractive(true)}
                onMouseLeave={() => setIsInteractive(false)}
                onFocus={() => setIsInteractive(true)}
                onBlur={() => setIsInteractive(false)}
            >
                {debounceInteractive && !isExpanded ? (
                    <Icon
                        type={IconType.NAV_DISPLAY_CONTROL}
                        height={16}
                        width={16}
                        alt="Expand"
                    />
                ) : (
                    <CarrierAvatar
                        carrier={activeCarrier}
                        alt={`${activeCarrier} Logo`}
                        height={20}
                        width={20}
                        className={styles.carrierLogo}
                    />
                )}
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
