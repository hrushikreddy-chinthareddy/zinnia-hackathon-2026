import { CarrierAvatar, CarrierName } from '@zinnia/bloom/components';

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
    switch (activeCarrier) {
        case 'farmers':
            return (
                <CarrierAvatar
                    carrier={CarrierName.FARMERS}
                    alt="Farmers Insurance Logo"
                    height={20}
                    width={20}
                    className={styles.carrierLogo}
                />
            );
        default:
            return (
                <ZinniaLogo
                    handleLogoClick={handleLogoClick}
                    isExpanded={isExpanded}
                    expandText={expandText}
                />
            );
    }
};
