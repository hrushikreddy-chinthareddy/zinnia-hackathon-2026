export type DelegatedAgent = {
    firstName: string | undefined;
    lastName: string | undefined;
    middleName: string | undefined;
    email: string | undefined;
    sellingCodes: string[];
    npn: string | undefined;
    // For some producers, the npn cannot be used as lookupId
    lookupId?: string;
    carrierShortName: string;
};
