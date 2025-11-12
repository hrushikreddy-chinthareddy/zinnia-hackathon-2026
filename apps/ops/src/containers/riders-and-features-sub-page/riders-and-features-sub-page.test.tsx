import {
    render,
    screen,
    cleanup,
    fireEvent,
    waitFor,
} from '@testing-library/react';
import { PolicyFeature, Rider, Status } from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';

import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { mockPolicy } from '@deps/jest/data/mockPolicy';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import RidersAndFeaturesSubPage from './riders-and-features-sub-page';
import { calculaterFilterProps } from './riders-and-features-sub-page.helpers';

jest.mock('next/router', () => ({
    useRouter: jest.fn(() => ({
        pathname: '/',
        events: {
            on: jest.fn(),
            off: jest.fn(),
        },
    })),
}));

afterEach(() => {
    cleanup();
    jest.clearAllMocks();
});

describe('<RidersAndFeaturesSubPage />', () => {
    describe('Verify the correct labels are passed', () => {
        it('should contain the correct h1', () => {
            render(
                <PolicyData.Provider
                    value={{
                        policy: mockPolicy,
                        policyDetails: new PolicyDetails(mockPolicy),
                        refreshPolicy: jest.fn(),
                    }}
                >
                    <RidersAndFeaturesSubPage />
                </PolicyData.Provider>
            );

            expect(screen.getByTestId('header-text')).toBeInTheDocument();
            expect(screen.getByTestId('header-text')).toHaveTextContent(
                'title'
            );
        });
    });

    describe('<TabGroup />', () => {
        it('shows the correct tabs with total', () => {
            render(
                <PolicyData.Provider
                    value={{
                        policy: mockPolicy,
                        policyDetails: new PolicyDetails(mockPolicy),
                        refreshPolicy: jest.fn(),
                    }}
                >
                    <RidersAndFeaturesSubPage />
                </PolicyData.Provider>
            );

            expect(screen.getByText('filter.Rider (0)')).toBeInTheDocument();
            expect(screen.getByText('filter.Feature (0)')).toBeInTheDocument();
        });

        it('should start with correct initial checked states', () => {
            render(
                <PolicyData.Provider
                    value={{
                        policy: mockPolicy,
                        policyDetails: new PolicyDetails(mockPolicy),
                        refreshPolicy: jest.fn(),
                    }}
                >
                    <RidersAndFeaturesSubPage />
                </PolicyData.Provider>
            );
            expect(screen.getByText(/filter.Rider/i)).toHaveAttribute(
                'aria-selected',
                'true'
            );
            expect(screen.getByText(/filter.Feature/i)).toHaveAttribute(
                'aria-selected',
                'false'
            );
        });

        it('should change tab state correctly when one is clicked', () => {
            render(
                <PolicyData.Provider
                    value={{
                        policy: mockPolicy,
                        policyDetails: new PolicyDetails(mockPolicy),
                        refreshPolicy: jest.fn(),
                    }}
                >
                    <RidersAndFeaturesSubPage />
                </PolicyData.Provider>
            );

            expect(screen.getByText(/filter.Rider/i)).toHaveAttribute(
                'aria-selected',
                'true'
            );
            fireEvent.click(screen.getByText(/filter.Feature/i));
            waitFor(() => {
                expect(screen.getByText(/filter.Feature/i)).toHaveAttribute(
                    'aria-selected',
                    'true'
                );
            });
        });
    });
});

describe('Riders and Features Helpers', () => {
    describe('.calculaterFilterProps', () => {
        it('returns the correct values for each filter type, including variant', () => {
            const futureEndDate = dayjs()
                .add(11, 'y')
                .format(ZAHARA_API_DATE_FORMAT);
            const pastDate = dayjs()
                .subtract(11, 'y')
                .format(ZAHARA_API_DATE_FORMAT);

            const [riders, features] = calculaterFilterProps({
                riders: [
                    { status: Status.TERMINATED },
                    { status: Status.PENDING },
                    { status: Status.ACTIVE },
                    { status: Status.ACTIVE },
                    { riderElected: 'NOTELECTED' },
                ] as Rider[],
                // terminated, active, available, available, not elected
                features: [
                    {
                        approvalDate: pastDate,
                        startDate: pastDate,
                        endDate: futureEndDate,
                    },
                    { startDate: pastDate, endDate: futureEndDate },
                    { startDate: pastDate, endDate: pastDate },
                ] as PolicyFeature[],
                // active, available, terminated
                t: ((key: any) => key) as TFunction,
            });

            expect(riders).toEqual({
                text: 'filter.Rider',
                value: 'Rider',
                quantity: 5,
                disabled: false,
                options: [
                    {
                        disabled: false,
                        quantity: 5,
                        text: 'filter.All',
                        value: 'All',
                    },
                    {
                        disabled: false,
                        quantity: 1,
                        text: 'filter.active',
                        value: 'active',
                    },
                    {
                        disabled: false,
                        quantity: 2,
                        text: 'filter.available',
                        value: 'available',
                    },
                    {
                        disabled: false,
                        quantity: 1,
                        text: 'filter.terminated',
                        value: 'terminated',
                    },
                    {
                        disabled: false,
                        quantity: 1,
                        text: 'filter.notElected',
                        value: 'notElected',
                    },
                ],
            });

            expect(features).toEqual({
                text: 'filter.Feature',
                value: 'Feature',
                quantity: 3,
                disabled: false,
                options: [
                    {
                        disabled: false,
                        quantity: 3,
                        text: 'filter.All',
                        value: 'All',
                    },
                    {
                        disabled: false,
                        quantity: 1,
                        text: 'filter.active',
                        value: 'active',
                    },
                    {
                        disabled: false,
                        quantity: 1,
                        text: 'filter.available',
                        value: 'available',
                    },
                    {
                        disabled: false,
                        quantity: 1,
                        text: 'filter.terminated',
                        value: 'terminated',
                    },
                ],
            });
        });
    });
});
