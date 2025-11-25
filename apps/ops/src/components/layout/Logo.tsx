import { CarrierLogo, CarrierName } from '@zinnia/bloom/components';
import Image from 'next/image';

export const Logo = ({ theme }: { theme: string | undefined }) => {
    switch (theme) {
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
                <Image
                    src="/images/logos/zinnia-logo-nav.svg"
                    alt="Zinnia Logo"
                    height={24}
                    width={90}
                />
            );
    }
};
