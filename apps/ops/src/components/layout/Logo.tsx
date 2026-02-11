import { CarrierLogo, CarrierName } from '@zinnia/bloom/components';
import Image from 'next/image';

import { getCarrierNameFromTheme } from '@deps/utils/theme';

export const Logo = ({ theme }: { theme: string | undefined }) => {
    const carrierName = getCarrierNameFromTheme(theme);

    if (carrierName !== CarrierName.ZINNIA) {
        return (
            <div style={{ minWidth: '127px' }}>
                <CarrierLogo
                    carrier={carrierName}
                    alt={`${carrierName} Logo`}
                    height={24}
                    width={127}
                />
            </div>
        );
    }

    return (
        <Image
            src="/images/logos/zinnia-logo-nav.svg"
            alt="Zinnia Logo"
            height={24}
            width={90}
        />
    );
};
