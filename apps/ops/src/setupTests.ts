// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// for ResizeObserver used in PopoverOnTruncate
import failOnConsole from 'jest-fail-on-console';
import ResizeObserver from 'resize-observer-polyfill';
import { TextEncoder, TextDecoder } from 'util';

import { HIDE_ANNUITIES_TOOLTIPS_DEPU_2749 } from './types/constants';

Object.assign(global, { TextDecoder, TextEncoder });

// Mock ResizeObserver for the testing environment
window.ResizeObserver = ResizeObserver;

// mock useTranslation
// mockT can be imported to verify parameters
export const mockT = jest.fn((key: any) => key);

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: mockT,
    }),
    i18n: {
        t: mockT,
    },
}));

if (HIDE_ANNUITIES_TOOLTIPS_DEPU_2749) {
    jest.mock('next/router', () => ({
        useRouter: jest.fn(() => ({
            push: jest.fn(),
            pathname: '',
        })),
    }));
}

failOnConsole();
