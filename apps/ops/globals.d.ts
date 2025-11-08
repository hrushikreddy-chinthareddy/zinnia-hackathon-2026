/* TODO: verify it's unused
declare module '*.svg' {
    const ReactComponent: React.FC<
        React.SVGProps<SVGSVGElement> & { title?: string }
    >;
    const content: string;

    export { ReactComponent };
    export default content;
}
*/

declare global {
    interface Window {
        pendo: {
            initialize: (config: {
                visitor: {
                    id: string; // Required if user is logged in
                    email?: string; // Recommended if using Pendo Feedback, or NPS Email
                    full_name?: string; // Recommended if using Pendo Feedback
                    role?: string; // Optional

                    // You can add any additional visitor level key-values here,
                    // as long as it's not one of the above reserved names.
                    [key: string]: string;
                };

                account: {
                    id: string; // Highly recommended, required if using Pendo Feedback or OEM Adopt
                    name?: string; // Optional
                    is_paying?: string; // Recommended if using Pendo Feedback
                    monthly_value?: string; // Recommended if using Pendo Feedback
                    planLevel?: string; // Optional
                    planPrice?: string; // Optional
                    creationDate?: string; // Optional

                    // You can add any additional account level key-values here,
                    // as long as it's not one of the above reserved names.
                    [key: string]: string;
                };
            }) => void;
        };
    }
}

export {};
