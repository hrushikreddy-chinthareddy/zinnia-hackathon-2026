import { HTMLAttributes, PropsWithChildren } from 'react';

export interface Pii {
    pii?: boolean;
    piiLevel?: string;
}

export interface PiiContext extends Pii {}

export interface PiiProps
    extends PropsWithChildren<HTMLAttributes<HTMLSpanElement>>,
        Pii {}
