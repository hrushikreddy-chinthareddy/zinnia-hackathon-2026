import { render, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import { useFocusOnError } from './useFocusOnError';

expect.extend(toHaveNoViolations);

// Mock requestAnimationFrame
let rafCallback: FrameRequestCallback | null = null;
const mockRaf = jest.fn((callback: FrameRequestCallback) => {
    rafCallback = callback;
    return 1;
});

beforeAll(() => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(mockRaf);
});

afterEach(() => {
    jest.clearAllMocks();
    rafCallback = null;
});

afterAll(() => {
    jest.restoreAllMocks();
});

// Helper to flush requestAnimationFrame
const flushRaf = () => {
    if (rafCallback) {
        rafCallback(0);
        rafCallback = null;
    }
};

interface TestComponentProps {
    errors: Record<string, string> | undefined;
    onTrigger?: () => void;
}

// Test Component that uses the hook
const TestComponent: React.FC<TestComponentProps> = ({ errors, onTrigger }) => {
    const { errorRef, triggerErrorFocus } = useFocusOnError(errors);

    const handleSubmit = () => {
        onTrigger?.();
        triggerErrorFocus();
    };

    return (
        <div ref={errorRef} data-testid="form-container">
            <div data-error-id="email">
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    data-testid="email-input"
                    aria-describedby={errors?.email ? 'email-error' : undefined}
                />
                {errors?.email && (
                    <span id="email-error" role="alert">
                        {errors.email}
                    </span>
                )}
            </div>
            <div data-error-id="password">
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    data-testid="password-input"
                    aria-describedby={
                        errors?.password ? 'password-error' : undefined
                    }
                />
                {errors?.password && (
                    <span id="password-error" role="alert">
                        {errors.password}
                    </span>
                )}
            </div>
            <button type="button" onClick={handleSubmit} data-testid="submit">
                Submit
            </button>
        </div>
    );
};

// Test Component with sr-only input (screen reader accessible but visually hidden)
const TestComponentWithSrOnly: React.FC<TestComponentProps> = ({ errors }) => {
    const { errorRef, triggerErrorFocus } = useFocusOnError(errors);

    return (
        <div ref={errorRef} data-testid="form-container">
            <fieldset data-error-id="terms">
                <legend>Terms and Conditions</legend>
                <label>
                    <input
                        type="checkbox"
                        className="sr-only"
                        data-testid="terms-checkbox"
                    />
                    I agree to the terms
                </label>
            </fieldset>
            <button
                type="button"
                onClick={triggerErrorFocus}
                data-testid="submit"
            >
                Submit
            </button>
        </div>
    );
};

// Test Component without focusable elements
const TestComponentNoFocusable: React.FC<TestComponentProps> = ({ errors }) => {
    const { errorRef, triggerErrorFocus } = useFocusOnError(errors);

    return (
        <div ref={errorRef} data-testid="form-container">
            <div data-error-id="customField" data-testid="custom-container">
                <span>Custom non-focusable content</span>
            </div>
            <button
                type="button"
                onClick={triggerErrorFocus}
                data-testid="submit"
            >
                Submit
            </button>
        </div>
    );
};

describe('useFocusOnError', () => {
    describe('basic functionality', () => {
        it('should return errorRef and triggerErrorFocus function', () => {
            let hookResult: ReturnType<typeof useFocusOnError> | null = null;

            const TestHookComponent = () => {
                hookResult = useFocusOnError({});
                return null;
            };

            render(<TestHookComponent />);

            expect(hookResult).not.toBeNull();
            expect(hookResult!.errorRef).toBeDefined();
            expect(hookResult!.triggerErrorFocus).toBeDefined();
            expect(typeof hookResult!.triggerErrorFocus).toBe('function');
        });

        it('should not focus when there are no errors', () => {
            const focusSpy = jest.fn();

            const { getByTestId } = render(
                <TestComponent errors={undefined} />
            );

            const emailInput = getByTestId('email-input') as HTMLInputElement;
            emailInput.focus = focusSpy;

            const submitButton = getByTestId('submit');

            act(() => {
                submitButton.click();
            });

            act(() => {
                flushRaf();
            });

            expect(focusSpy).not.toHaveBeenCalled();
        });

        it('should not focus when errors object is empty', () => {
            const focusSpy = jest.fn();

            const { getByTestId } = render(<TestComponent errors={{}} />);

            const emailInput = getByTestId('email-input') as HTMLInputElement;
            emailInput.focus = focusSpy;

            const submitButton = getByTestId('submit');

            act(() => {
                submitButton.click();
            });

            act(() => {
                flushRaf();
            });

            expect(focusSpy).not.toHaveBeenCalled();
        });
    });

    describe('focus behavior', () => {
        it('should focus on the first error field when errors exist', () => {
            const focusSpy = jest.fn();
            const scrollIntoViewSpy = jest.fn();

            const { getByTestId } = render(
                <TestComponent errors={{ email: 'Email is required' }} />
            );

            const emailInput = getByTestId('email-input') as HTMLInputElement;
            emailInput.focus = focusSpy;
            emailInput.scrollIntoView = scrollIntoViewSpy;

            const submitButton = getByTestId('submit');

            act(() => {
                submitButton.click();
            });

            act(() => {
                flushRaf();
            });

            expect(focusSpy).toHaveBeenCalled();
            expect(scrollIntoViewSpy).toHaveBeenCalledWith({
                behavior: 'smooth',
                block: 'center',
            });
        });

        it('should focus on first error when multiple errors exist', () => {
            const emailFocusSpy = jest.fn();
            const passwordFocusSpy = jest.fn();
            const scrollIntoViewSpy = jest.fn();

            const { getByTestId } = render(
                <TestComponent
                    errors={{
                        email: 'Email is required',
                        password: 'Password is required',
                    }}
                />
            );

            const emailInput = getByTestId('email-input') as HTMLInputElement;
            emailInput.focus = emailFocusSpy;
            emailInput.scrollIntoView = scrollIntoViewSpy;

            const passwordInput = getByTestId(
                'password-input'
            ) as HTMLInputElement;
            passwordInput.focus = passwordFocusSpy;

            const submitButton = getByTestId('submit');

            act(() => {
                submitButton.click();
            });

            act(() => {
                flushRaf();
            });

            expect(emailFocusSpy).toHaveBeenCalled();
            expect(passwordFocusSpy).not.toHaveBeenCalled();
        });

        it('should refocus on subsequent submit attempts', () => {
            const focusSpy = jest.fn();
            const scrollIntoViewSpy = jest.fn();

            const { getByTestId } = render(
                <TestComponent errors={{ email: 'Email is required' }} />
            );

            const emailInput = getByTestId('email-input') as HTMLInputElement;
            emailInput.focus = focusSpy;
            emailInput.scrollIntoView = scrollIntoViewSpy;

            const submitButton = getByTestId('submit');

            // First submit
            act(() => {
                submitButton.click();
            });
            act(() => {
                flushRaf();
            });

            expect(focusSpy).toHaveBeenCalledTimes(1);

            // Second submit
            act(() => {
                submitButton.click();
            });
            act(() => {
                flushRaf();
            });

            expect(focusSpy).toHaveBeenCalledTimes(2);
        });
    });

    describe('sr-only element handling', () => {
        it('should scroll to parent label/fieldset when input has sr-only class', () => {
            const focusSpy = jest.fn();
            const inputScrollSpy = jest.fn();
            const labelScrollSpy = jest.fn();

            const { getByTestId, container } = render(
                <TestComponentWithSrOnly
                    errors={{ terms: 'You must accept the terms' }}
                />
            );

            const checkbox = getByTestId('terms-checkbox') as HTMLInputElement;
            checkbox.focus = focusSpy;
            checkbox.scrollIntoView = inputScrollSpy;

            // The checkbox is directly inside a <label>, so .closest('label, fieldset')
            // returns the <label> element (not the fieldset)
            const label = container.querySelector('label');
            if (label) {
                label.scrollIntoView = labelScrollSpy;
            }

            const submitButton = getByTestId('submit');

            act(() => {
                submitButton.click();
            });

            act(() => {
                flushRaf();
            });

            expect(focusSpy).toHaveBeenCalled();
            // When element is sr-only, it should scroll to closest parent label/fieldset
            expect(labelScrollSpy).toHaveBeenCalledWith({
                behavior: 'smooth',
                block: 'center',
            });
            expect(inputScrollSpy).not.toHaveBeenCalled();
        });
    });

    describe('fallback behavior', () => {
        it('should scroll to error container when no focusable element exists', () => {
            const containerScrollSpy = jest.fn();

            const { getByTestId } = render(
                <TestComponentNoFocusable
                    errors={{ customField: 'Field is required' }}
                />
            );

            const customContainer = getByTestId('custom-container');
            customContainer.scrollIntoView = containerScrollSpy;

            const submitButton = getByTestId('submit');

            act(() => {
                submitButton.click();
            });

            act(() => {
                flushRaf();
            });

            expect(containerScrollSpy).toHaveBeenCalledWith({
                behavior: 'smooth',
                block: 'center',
            });
        });
    });

    describe('edge cases', () => {
        it('should handle undefined errors gracefully', () => {
            const { getByTestId } = render(
                <TestComponent errors={undefined} />
            );

            const submitButton = getByTestId('submit');

            // Should not throw
            expect(() => {
                act(() => {
                    submitButton.click();
                });
                act(() => {
                    flushRaf();
                });
            }).not.toThrow();
        });

        it('should not trigger focus if submitAttempt is still 0 after render', () => {
            const focusSpy = jest.fn();

            const { getByTestId } = render(
                <TestComponent errors={{ email: 'Email is required' }} />
            );

            const emailInput = getByTestId('email-input') as HTMLInputElement;
            emailInput.focus = focusSpy;

            // Don't click submit, just flush any pending rafs
            act(() => {
                flushRaf();
            });

            expect(focusSpy).not.toHaveBeenCalled();
        });

        it('should handle errors object with no matching data-error-id elements', () => {
            const { getByTestId } = render(
                <TestComponent errors={{ nonExistentField: 'Error message' }} />
            );

            const submitButton = getByTestId('submit');

            // Should not throw when data-error-id doesn't exist
            expect(() => {
                act(() => {
                    submitButton.click();
                });
                act(() => {
                    flushRaf();
                });
            }).not.toThrow();
        });
    });

    describe('accessibility', () => {
        it('should have no accessibility violations in test component', async () => {
            const { container } = render(
                <TestComponent
                    errors={{
                        email: 'Email is required',
                        password: 'Password is required',
                    }}
                />
            );

            const results = await axe(container);
            expect(results).toHaveNoViolations();
        });

        it('should have no accessibility violations with sr-only elements', async () => {
            const { container } = render(
                <TestComponentWithSrOnly
                    errors={{ terms: 'You must accept the terms' }}
                />
            );

            const results = await axe(container);
            expect(results).toHaveNoViolations();
        });
    });
});
