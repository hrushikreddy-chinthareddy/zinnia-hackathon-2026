import { renderHook } from '@testing-library/react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { useNavLink } from './useNavLink';

i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
        en: {
            translation: {
                allFields: {
                    openInNewWindow: 'Open in new window',
                },
            },
        },
    },
    interpolation: { escapeValue: false },
});

describe('get text from nav-link components', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation();
        jest.spyOn(console, 'warn').mockImplementation();
    });

    describe('transformChildrenToString', () => {
        it('should convert a children string node into string', () => {
            const { result } = renderHook(() => useNavLink());
            const { transformChildrenToString } = result.current;
            const value = 'text';
            const TestComponent = <span>{value}</span>;
            const componentText = transformChildrenToString(TestComponent);
            expect(componentText).toBe(value);
        });
        it('should convert a children react node with a child node into string', () => {
            const { result } = renderHook(() => useNavLink());
            const { transformChildrenToString } = result.current;
            const value = 'text';
            const TestComponent = (
                <div>
                    <button>
                        <img />
                        <span>{value}</span>
                    </button>
                </div>
            );
            const componentText = transformChildrenToString(TestComponent);
            expect(componentText).toBe(value);
        });
        it('should not convert a react node ', () => {
            const { result } = renderHook(() => useNavLink());
            const { transformChildrenToString } = result.current;
            const value = '';
            const TestComponent = (
                <div>
                    <img />
                </div>
            );
            const componentText = transformChildrenToString(TestComponent);
            expect(componentText).toBe(value);
        });
        it('should convert a children react node into string', () => {
            const { result } = renderHook(() => useNavLink());
            const { transformChildrenToString } = result.current;
            const value = 'text';
            const TestComponent = (
                <button>
                    <span>{value}</span>
                </button>
            );
            const componentText = transformChildrenToString(TestComponent);
            expect(componentText).toBe(value);
        });

        it('should return arial-label text ready for link target blank', () => {
            const { result } = renderHook(() => useNavLink());
            const { getLinkText } = result.current;
            const value = 'text';
            const TestComponent = (
                <a target="_blank">
                    <span>{value}</span>
                </a>
            );
            const componentText = getLinkText('_blank', TestComponent);
            expect(componentText).toBe(`${value} Open in new window`);
        });

        it('should return the open in new window label', () => {
            const { result } = renderHook(() => useNavLink());
            const { OPEN_IN_NEW_WINDOW_LABEL } = result.current;

            expect(OPEN_IN_NEW_WINDOW_LABEL).toBe('Open in new window');
        });
    });
});
