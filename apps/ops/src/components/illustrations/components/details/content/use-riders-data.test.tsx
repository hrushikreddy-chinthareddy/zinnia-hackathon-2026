import { render, renderHook, screen } from '@testing-library/react';
import { format } from 'path';

import { IllustrationDetailProvider } from '@deps/components/illustrations/providers/IllustrationDetailProvider';
import { Illustration } from '@deps/queries/api/v3/illustrations';

import { useIllustrationRidersData } from './use-riders-data';

type DeepPartial<T> = T extends object
    ? {
          [P in keyof T]?: DeepPartial<T[P]>;
      }
    : T;

describe('useIllustrationRidersData', () => {
    const renderHookWithIllustration = (
        illustration: DeepPartial<Illustration> | null
    ) =>
        renderHook(() => useIllustrationRidersData(), {
            wrapper: ({ children }) => (
                <IllustrationDetailProvider value={illustration as any}>
                    {children}
                </IllustrationDetailProvider>
            ),
        });

    it('returns an empty array when the illustration is not available', async () => {
        const { result } = renderHookWithIllustration(null);

        expect(result.current).toEqual([]);
    });

    it('returns an empty array when the illustration has no riders', async () => {
        const { result } = renderHookWithIllustration({
            response: {
                assumed: {
                    coverages: {
                        base: {},
                    },
                },
            },
        });

        expect(result.current).toEqual([]);
    });

    it('returns the riders data', async () => {
        const { result } = renderHookWithIllustration({
            productType: 'TERM',
            response: {
                assumed: {
                    coverages: {
                        base: {},
                        accidentalDeathBenefit: {
                            premium: 1000,
                        },
                        childrensTerm: {
                            premium: 200,
                        },
                    },
                },
            },
        });

        const serializableValues = result.current.map(
            ({ format, ...rest }) => rest
        );

        expect(serializableValues).toEqual([
            {
                label: 'clientCase.illustrationDetails.riders.accidentalDeathBenefit',
                value: 1000,
            },
            {
                label: 'clientCase.illustrationDetails.riders.childrensTerm',
                value: 200,
            },
        ]);

        const expectedText = [
            '$1,000clientCase.illustrationDetails.valuePerYear',
            '$200clientCase.illustrationDetails.valuePerYear',
        ];

        result.current.forEach(({ format }, idx) => {
            const { unmount, baseElement } = render(format());

            expect(baseElement.textContent).toEqual(expectedText[idx]);
            unmount();
        });
    });
});
