import { CarrierName } from '@zinnia/bloom/components';
import { getCookie } from 'cookies-next';
import { useEffect, useState } from 'react';

export default function useUserCarrier(): CarrierName {
    const [userCarrier, setUserCarrier] = useState<CarrierName>(
        CarrierName.ZINNIA
    );
    useEffect(() => {
        const cookie = getCookie('role') as string | undefined;
        if (cookie == 'farmers') {
            setUserCarrier(CarrierName.FARMERS);
        }
    }, []);

    return userCarrier;
}
