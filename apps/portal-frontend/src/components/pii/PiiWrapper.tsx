import DOMPurify from 'dompurify';
import React, { forwardRef } from 'react';

import { PiiProps } from '@deps/components/pii/pii';

export const PiiWrapper = forwardRef<HTMLSpanElement, PiiProps>(function piiWrapper({ children, ...rest }, ref) {
    if (typeof children === 'string') {
        const sanitizedHtml = DOMPurify.sanitize(children);  // Sanitize the HTML content
        //For string children, render the sanitized HTML using danglySetInnerHTML
        return (
            <span ref={ref} data-ispii="true" {...rest} dangerouslySetInnerHTML={{ __html: sanitizedHtml }}></span>
        );
    } else {
        // For non-string children, render normally.
        return (
            <span ref={ref} data-ispii="true" {...rest}>
                {children}
            </span>
        );
    }
});
