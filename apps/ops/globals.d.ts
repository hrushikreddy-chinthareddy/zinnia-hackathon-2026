export type PendoOptions = {
    visitor: {
        id: string; // Required if user is logged in
        email?: string; // Recommended if using Pendo Feedback, or NPS Email
        full_name?: string; // Recommended if using Pendo Feedback
        roles?: string[]; // Optional
        carrierAccessList?: string[]; // Optional
    };

    account: {
        id: string; // Highly recommended, required if using Pendo Feedback or OEM Adopt
        name?: string; // Optional
        is_paying?: string; // Recommended if using Pendo Feedback
        monthly_value?: string; // Recommended if using Pendo Feedback
        planLevel?: string; // Optional
        planPrice?: string; // Optional
        creationDate?: string; // Optional
    };
};
declare global {
    interface Window {
        pendo: {
            initialize: (config: PendoOptions) => void;
            updateOptions: (config: PendoUpdateOptions) => void;
        };
    }
}

export {};
