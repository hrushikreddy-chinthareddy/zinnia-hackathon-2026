import { useCallback, useEffect, useRef, useState, RefObject } from 'react';

interface UseFocusOnErrorReturn {
    errorRef: RefObject<HTMLDivElement>;
    triggerErrorFocus: () => void;
}

export const useFocusOnError = <T extends object | undefined>(
    errors: T
): UseFocusOnErrorReturn => {
    const errorRef = useRef<HTMLDivElement>(null);
    const [submitAttempt, setSubmitAttempt] = useState(0);
    const lastSubmitAttemptRef = useRef(0);

    const triggerErrorFocus = useCallback(() => {
        setSubmitAttempt((prev) => prev + 1);
    }, []);

    // this useEffect is used to focus the first error field when the submit attempt changes
    useEffect(() => {
        if (submitAttempt === lastSubmitAttemptRef.current) {
            return;
        }
        lastSubmitAttemptRef.current = submitAttempt;

        const errorKeys = errors ? Object.keys(errors) : [];
        const hasErrors = errorKeys.length > 0;

        // Focus first error field every time submit is attempted with errors
        if (hasErrors && errorRef.current && submitAttempt > 0) {
            requestAnimationFrame(() => {
                if (!errorRef.current) return;

                // Get the first error key to target the specific field
                const firstErrorKey = errorKeys[0];

                // Find element by data-error-id attribute
                const errorContainer = errorRef.current.querySelector(
                    `[data-error-id="${firstErrorKey}"]`
                );

                // Find focusable element within the container
                const firstErrorElement = errorContainer?.querySelector(
                    'input, textarea, select, [tabindex]:not([tabindex="-1"])'
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
                } else if (errorContainer) {
                    // Fallback: scroll to the error container
                    (errorContainer as HTMLElement).scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    });
                }
            });
        }
    }, [errors, submitAttempt]);

    return { errorRef, triggerErrorFocus };
};
