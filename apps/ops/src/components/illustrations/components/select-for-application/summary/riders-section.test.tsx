import { render, screen } from '@testing-library/react';

import { IllustrationDetailProvider } from '@deps/components/illustrations/providers/IllustrationDetailProvider';

import RidersSection from './riders-section';
import { useIllustrationRidersData } from '../../details/content/use-riders-data';

jest.mock('../../details/content/use-riders-data', () => {
    return {
        __esModule: true,
        useIllustrationRidersData: jest.fn(() => []),
    };
});

describe('IllustrationSelectForApplicationSectionRiders', () => {
    const mockWithRiders = () =>
        (useIllustrationRidersData as jest.Mock).mockImplementation(() => [
            {
                label: 'Accidental Death Benefit',
                format: () => '$1000.00',
                value: 1000,
            },
            {
                label: 'Overloan Protection',
                format: () => '$200.00',
                value: 200,
            },
        ]);

    const mockWithoutRiders = () =>
        (useIllustrationRidersData as jest.Mock).mockImplementation(() => []);

    it('Should show "Included" for IUL illustrations', async () => {
        mockWithRiders();
        render(
            <IllustrationDetailProvider
                value={
                    {
                        productType: 'INDEX_UNIVERSAL_LIFE',
                    } as any
                }
            >
                <RidersSection />
            </IllustrationDetailProvider>
        );

        expect(useIllustrationRidersData).toHaveBeenCalled();

        await screen.getByText('Accidental Death Benefit');
        await screen.getByText('Overloan Protection');

        const nodes = await screen.getAllByText(
            'clientCase.illustrationDetails.riders.included'
        );
        expect(nodes.length).toEqual(2);

        expect(screen.queryByText('1000')).not.toBeInTheDocument();
        expect(screen.queryByText('200')).not.toBeInTheDocument();
    });

    it('Should show formated values for non IUL illustrations', async () => {
        mockWithRiders();
        render(
            <IllustrationDetailProvider
                value={
                    {
                        productType: 'TERM',
                    } as any
                }
            >
                <RidersSection />
            </IllustrationDetailProvider>
        );

        await screen.getByText('Accidental Death Benefit');
        await screen.getByText('Overloan Protection');

        await screen.findByText(
            'clientCase.illustrationDetails.riders.includedInPremiumsFootNote'
        );

        const nodes = await screen.queryAllByText(
            'clientCase.illustrationDetails.riders.included'
        );
        expect(nodes.length).toEqual(0);

        expect(screen.queryByText('$1000.00')).toBeInTheDocument();
        expect(screen.queryByText('$200.00')).toBeInTheDocument();
    });

    it('Should show no riders text for non IUL illustrations', async () => {
        mockWithoutRiders();
        render(
            <IllustrationDetailProvider
                value={
                    {
                        productType: 'TERM',
                    } as any
                }
            >
                <RidersSection />
            </IllustrationDetailProvider>
        );
        await screen.findByText(
            'clientCase.illustrationDetails.riders.noRiders'
        );
    });
});
