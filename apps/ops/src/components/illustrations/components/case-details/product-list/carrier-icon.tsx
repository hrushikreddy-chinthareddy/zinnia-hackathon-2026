import { CarrierAvatar, CarrierName } from '@zinnia/bloom/components';

const CarrierIcon = ({ carrierCode }: { carrierCode: string }) => {
    switch (carrierCode) {
        case 'FNWL':
            return (
                <CarrierAvatar
                    carrier={CarrierName.FARMERS}
                    alt={CarrierName.FARMERS}
                />
            );
        default:
            return (
                <CarrierAvatar
                    carrier={CarrierName.ZINNIA}
                    alt={CarrierName.FARMERS}
                />
            );
    }
};

export default CarrierIcon;
