import { render, screen } from '@testing-library/react';
import { TFunction } from 'i18next';
import React from 'react';

import { useOptimizely } from '@deps/contexts/OptimizelyContext';

import { NameCard } from './name-card';

jest.mock('@deps/contexts/OptimizelyContext', () => ({
    __esModule: true,
    useOptimizely: jest.fn(),
}));

describe('NameCard', () => {
    const mockT: TFunction = (key: any) => key;

    beforeEach(() => {
        (useOptimizely as jest.Mock).mockReturnValue({
            featureFlags: {
                PARTY_NAME_CHANGE_TRANSACTION: true,
            },
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders children', () => {
        render(
            <NameCard t={mockT}>
                <p>Test Child</p>
            </NameCard>
        );

        expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('renders edit icon when editable is true and feature flag is true', () => {
        render(
            <NameCard editable={true} t={mockT}>
                <p data-testid="edit-icon">Child</p>
            </NameCard>
        );
        expect(
            screen.getByTestId('edit-icon') as HTMLInputElement
        ).toBeInTheDocument();
    });

    it('does not render edit icon when editable is false', () => {
        render(
            <NameCard editable={false} t={mockT}>
                <p>Child</p>
            </NameCard>
        );
        expect(
            screen.queryByTestId('edit-icon') as HTMLInputElement
        ).not.toBeInTheDocument();
    });
});
