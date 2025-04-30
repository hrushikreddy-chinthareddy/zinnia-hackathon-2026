import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';

import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { mockPolicy } from '@deps/jest/data/mockPolicy';
import { PolicyFeature, Rider, Status } from '@deps/models/policy/sor-policy';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import RidersAndFeaturesContainer from './riders-and-features-sub-page';
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

describe('Riders and Features Container', () => {
    describe('Verify the correct labels are passed', () => {
        it('should contain the correct h1', () => {
            render(
                <PolicyData.Provider value={{ policy: mockPolicy, policyDetails: new PolicyDetails(mockPolicy), refreshPolicy: jest.fn() }}>
                    <RidersAndFeaturesContainer />
                </PolicyData.Provider>
            );

            expect(screen.getByTestId('header-text')).toBeInTheDocument();
            expect(screen.getByTestId('header-text')).toHaveTextContent('title');
        });
    });

    describe('filter chips', () => {
        it('should contain the correct chips', () => {
            render(
                <PolicyData.Provider value={{ policy: mockPolicy, policyDetails: new PolicyDetails(mockPolicy), refreshPolicy: jest.fn() }}>
                    <RidersAndFeaturesContainer />
                </PolicyData.Provider>
            );

            expect(screen.getByText('filter.label')).toBeInTheDocument();
            expect(screen.getByText('All')).toBeInTheDocument();
            expect(screen.getByText('filter.Rider')).toBeInTheDocument();
            expect(screen.getByText('filter.Feature')).toBeInTheDocument();
            expect(screen.getByText('filter.active')).toBeInTheDocument();
            expect(screen.getByText('filter.available')).toBeInTheDocument();
            expect(screen.getByText('filter.terminated')).toBeInTheDocument();
            expect(screen.getByText('filter.notElected')).toBeInTheDocument();
        });

        it('should start with correct initial checked states', () => {
            render(
                <PolicyData.Provider value={{ policy: mockPolicy, policyDetails: new PolicyDetails(mockPolicy), refreshPolicy: jest.fn() }}>
                    <RidersAndFeaturesContainer />
                </PolicyData.Provider>
            );

            expect(screen.getByText('All')).toHaveAttribute('aria-checked', 'true');
            expect(screen.getByText('filter.Rider')).toHaveAttribute('aria-checked', 'false');
            expect(screen.getByText('filter.Feature')).toHaveAttribute('aria-checked', 'false');
            expect(screen.getByText('filter.active')).toHaveAttribute('aria-checked', 'false');
            expect(screen.getByText('filter.available')).toHaveAttribute('aria-checked', 'false');
            expect(screen.getByText('filter.terminated')).toHaveAttribute('aria-checked', 'false');
            expect(screen.getByText('filter.notElected')).toHaveAttribute('aria-checked', 'false');
        });

        it('should change chip states correctly when one is clicked', () => {
            render(
                <PolicyData.Provider value={{ policy: mockPolicy, policyDetails: new PolicyDetails(mockPolicy), refreshPolicy: jest.fn() }}>
                    <RidersAndFeaturesContainer />
                </PolicyData.Provider>
            );

            expect(screen.getByText('All')).toHaveAttribute('aria-checked', 'true');
            expect(screen.getByText('filter.Rider')).toHaveAttribute('aria-checked', 'false');
            fireEvent.click(screen.getByText('filter.Rider'));
            waitFor(() => {
                expect(screen.getByText('filter.Rider')).toHaveAttribute('aria-checked', 'true');
            });
        });
    });
});

describe('Riders and Features Helpers', () => {
    describe('calculaterFilterProps', () => {
        it('returns the correct values for each filter type, including variant', () => {
            const futureEndDate = dayjs().add(11, 'y').format(ZAHARA_API_DATE_FORMAT);
            const pastDate = dayjs().subtract(11, 'y').format(ZAHARA_API_DATE_FORMAT);

            const [riders, features, active, available, terminated, notElected] = calculaterFilterProps({
                riders: [
                    { status: Status.TERMINATED },
                    { status: Status.PENDING },
                    { status: Status.ACTIVE },
                    { status: Status.ACTIVE },
                    { riderElected: 'NOT ELECTED' },
                ] as Rider[],
                // terminated, active, available, available, not elected
                features: [
                    { approvalDate: pastDate, startDate: pastDate, endDate: futureEndDate },
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
            });

            expect(features).toEqual({
                text: 'filter.Feature',
                value: 'Feature',
                quantity: 3,
                disabled: false,
            });

            expect(active).toEqual({
                text: 'filter.active',
                value: 'active',
                quantity: 2,
                disabled: false,
            });

            expect(available).toEqual({
                text: 'filter.available',
                value: 'available',
                quantity: 3,
                disabled: false,
            });

            expect(terminated).toEqual({
                text: 'filter.terminated',
                value: 'terminated',
                quantity: 2,
                disabled: false,
            });

            expect(notElected).toEqual({
                text: 'filter.notElected',
                value: 'notElected',
                quantity: 1,
                disabled: false,
            });
        });

        it('returns the correct order', () => {
            const [riders, available, terminated, notElected, features, active] = calculaterFilterProps({
                riders: [
                    { status: Status.TERMINATED },
                    { status: Status.TERMINATED },
                    { status: Status.ACTIVE },
                    { status: Status.ACTIVE },
                    { status: Status.ACTIVE },
                    { riderElected: 'NOT ELECTED' },
                ] as Rider[],
                // terminated, terminated, available, available, available, not elected
                features: [] as PolicyFeature[],
                t: ((key: any) => key) as TFunction,
            });

            expect(riders).toEqual({
                text: 'filter.Rider',
                value: 'Rider',
                quantity: 6,
                disabled: false,
            });

            expect(available).toEqual({
                text: 'filter.available',
                value: 'available',
                quantity: 3,
                disabled: false,
            });

            expect(terminated).toEqual({
                text: 'filter.terminated',
                value: 'terminated',
                quantity: 2,
                disabled: false,
            });

            expect(notElected).toEqual({
                text: 'filter.notElected',
                value: 'notElected',
                quantity: 1,
                disabled: false,
            });

            expect(features).toEqual({
                text: 'filter.Feature',
                value: 'Feature',
                quantity: 0,
                disabled: true,
            });

            expect(active).toEqual({
                text: 'filter.active',
                value: 'active',
                quantity: 0,
                disabled: true,
            });
        });
    });
});
