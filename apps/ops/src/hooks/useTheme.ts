import { CarrierName } from '@zinnia/bloom/components';
import { getCookie } from 'cookies-next';
import { useEffect, useState } from 'react';

import {
    getCarrierNameFromTheme,
    getThemeFromRole,
    Theme,
} from '@deps/utils/theme';

export const useTheme = () => {
    const [carrierName, setCarrierName] = useState<CarrierName>(
        CarrierName.ZINNIA
    );
    const faviconPath = process.env.NEXT_PUBLIC_FAVICON_PATH || '/favicon.ico';

    const [theme, setTheme] = useState<Theme>(Theme.ZINNIA);

    useEffect(() => {
        const role = getCookie('role');
        const themeFromRole = getThemeFromRole(role);
        setCarrierName(getCarrierNameFromTheme(themeFromRole));
        setTheme(themeFromRole);
    }, []);

    return { carrierName, faviconPath, theme };
};
