import { CarrierLogo, CarrierName } from '@zinnia/bloom/components';

import { ZinniaLogo } from './ZinniaLogo';

export const ExpandedLogo = ({
    activeCarrier,
    isExpanded,
}: {
    activeCarrier: CarrierName;
    isExpanded: boolean;
}) => {
    if (activeCarrier && activeCarrier !== CarrierName.ZINNIA) {
        return (
            <div style={{ minWidth: '127px' }}>
                <CarrierLogo
                    carrier={activeCarrier}
                    alt={`${activeCarrier} Logo`}
                    height={24}
                    width={127}
                />
            </div>
        );
    }

    return <ZinniaLogo isExpanded={isExpanded} />;
};
