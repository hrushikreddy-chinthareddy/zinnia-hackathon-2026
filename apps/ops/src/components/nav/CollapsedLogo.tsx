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
    if (activeCarrier && activeCarrier !== CarrierName.ZINNIA) {
        return (
            <CarrierAvatar
                carrier={activeCarrier}
                alt={`${activeCarrier} Logo`}
                height={20}
                width={20}
                className={styles.carrierLogo}
            />
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
