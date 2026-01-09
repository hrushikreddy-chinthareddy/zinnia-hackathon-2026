declare module 'https://d1f4og57rdeq5x.cloudfront.net/zembed/v1.0.0/zembed-bootstraper.mjs' {
    export function initEmbeddedComponents(config: {
        clientId: string;
        modules: string[];
        debug?: boolean;
        accessToken: () => Promise<string>;
    }): Promise<void>;
}

declare namespace JSX {
    interface IntrinsicElements {
        'zen-order-entry': React.DetailedHTMLProps<
            React.HTMLAttributes<HTMLElement>,
            HTMLElement
        >;
    }
}
