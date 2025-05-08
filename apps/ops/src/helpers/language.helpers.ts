import { isLocalStorageEnabled } from './local-storage.hepler';

export const getLanguage = () => {
    return isLocalStorageEnabled() && localStorage.getItem('language');
};

export const setLanguage = (lang: string) => {
    isLocalStorageEnabled() && localStorage.setItem('language', lang);
};
