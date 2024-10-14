export const isLocalStorageEnabled = () => {
    return typeof window !== 'undefined' && window && window.localStorage;
};
