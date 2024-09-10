import { useEffect } from 'react';

export const useStylesheet = (href: string) => {
    useEffect(() => {
        const link = document.createElement('link');
        link.href = href;
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        return () => {
            document.head.removeChild(link);
        };
    }, [href]);
};
