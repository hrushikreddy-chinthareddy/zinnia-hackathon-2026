export const isAccountNumberValid = (accountNumber: string): boolean => {
    return /^\d{8,17}$/.test(accountNumber);
};

export const isRoutingNumberValid = (routingNumber: string): boolean => {
    if (!routingNumber || !routingNumber.length) {
        return false;
    }

    return routingNumber.trim().length === 9;
};
