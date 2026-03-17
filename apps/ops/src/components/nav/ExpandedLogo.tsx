import { CarrierLogo, CarrierName } from '@zinnia/bloom/components';

import { ZinniaLogo } from './ZinniaLogo';

export const ExpandedLogo = ({
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
            <button style={{ minWidth: '127px' }}>
                <CarrierLogo
                    carrier={activeCarrier}
                    alt={`${activeCarrier} Logo`}
                    height={24}
                    width={127}
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
