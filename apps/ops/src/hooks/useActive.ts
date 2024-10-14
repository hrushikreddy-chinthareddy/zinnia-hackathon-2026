import { useRouter } from 'next/router';

import { SubLink } from '@deps/config/nav.config';

export const useActive = (link: SubLink) => {
    const { asPath } = useRouter();
    const collectedHrefs = [link.href, ...(link.subLinks?.map(sublink => sublink.href) || [])];
    const isActive = collectedHrefs.includes(asPath);

    return isActive;
};
