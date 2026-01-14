import { useEffect, useRef, RefObject } from 'react';

export const useFocusOnError = <T extends object | undefined>(
    errors: T,
    submitAttempt: number
): RefObject<HTMLDivElement> => {
    const formRef = useRef<HTMLDivElement>(null);
    const lastSubmitAttemptRef = useRef(0);
    // this useEffect is used to focus the first error field when the submit attempt changes
    useEffect(() => {
        if (submitAttempt === lastSubmitAttemptRef.current) {
            return;
        }
        lastSubmitAttemptRef.current = submitAttempt;

        const errorKeys = errors ? Object.keys(errors) : [];
        const hasErrors = errorKeys.length > 0;

        // Focus first error field every time submit is attempted with errors
        if (hasErrors && formRef.current && submitAttempt > 0) {
            requestAnimationFrame(() => {
                if (!formRef.current) return;
                const firstErrorElement = formRef.current.querySelector(
                    '.border-semantic-error input, .border-semantic-error textarea, .border-semantic-error select, [data-error-focus="true"]'
                ) as HTMLElement;

                if (firstErrorElement) {
                    firstErrorElement.focus();
                    const scrollTarget = firstErrorElement.classList.contains(
                        'sr-only'
                    )
                        ? firstErrorElement.closest('label, fieldset') ||
                          firstErrorElement.parentElement
                        : firstErrorElement;

                    scrollTarget?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    });
                } else {
                    const fallbackElement = formRef.current.querySelector(
                        '[class*="border-semantic-error"], [class*="text-semantic-error"], .case-document-error'
                    ) as HTMLElement;
                    fallbackElement?.focus();
                }
            });
        }
    }, [errors, submitAttempt]);

    return formRef;
};
