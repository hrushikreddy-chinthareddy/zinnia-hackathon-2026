export type PendoOptions = {
    visitor: {
        id: string; // Required if user is logged in
        email?: string; // Recommended if using Pendo Feedback, or NPS Email
        full_name?: string; // Recommended if using Pendo Feedback
        firstLogin?: string; // Optional
        isInternalZinniaUser?: string; // Optional
        roles?: string[]; // Optional
        carrierAccessList?: string[]; // Optional
    };

    account: {
        id: string; // Highly recommended, required if using Pendo Feedback or OEM Adopt
    };
};
declare global {
    interface Window {
        pendo?: {
            initialize: (config: PendoOptions) => void;
            updateOptions: (config: PendoUpdateOptions) => void;
        };
        __highChartsModulesInit?: boolean;
    }
}

export {};
