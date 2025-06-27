import { deleteCookie, hasCookie, setCookie } from 'cookies-next';
import { MouseEvent, useEffect, useState } from 'react';

import { MOCK_COOKIE_KEY } from '@deps/queries/api-utils/serverClientUtils';

const useMock = () => {
    const [isMockOn, setIsMockOn] = useState(false);
    const mockText = isMockOn ? 'Turn Mocks Off' : 'Turn Mocks On';

    const cookieExists = (): boolean => {
        return hasCookie(MOCK_COOKIE_KEY);
    };

    useEffect(() => {
        setIsMockOn(cookieExists());
    }, []);

    const setMock = (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        if (isMockOn) {
            deleteCookie(MOCK_COOKIE_KEY);
        } else {
            setCookie(MOCK_COOKIE_KEY, 'on');
        }
        const queryParams = new URLSearchParams(location.search);
        queryParams.delete(MOCK_COOKIE_KEY);

        const params = queryParams.toString()
            ? `?${queryParams.toString()}`
            : '';

        window.location.href = `${window.location.origin}/policies${params}`;
    };

    return {
        mockText,
        isMockOn,
        setMock,
    };
};

export default useMock;
