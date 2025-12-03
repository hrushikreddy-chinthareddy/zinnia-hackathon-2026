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
    switch (activeCarrier) {
        case 'farmers':
            return (
                <div style={{ minWidth: '127px' }}>
                    <CarrierLogo
                        carrier={CarrierName.FARMERS}
                        height={24}
                        width={127}
                    />
                </div>
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
