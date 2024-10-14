import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { Processes } from '@deps/models/case/case';

import ActiveFilters from './active-filters';

const baseFilters = {
    showOnlyCompletedCases: false,
    showOnlyCanceledCases: false,
    processTypes: new Set([]),
    requestSubType: new Set([]),
    products: new Set([]),
};

describe('ActiveFilters', () => {
    describe('render tests', () => {
        it('returns null if there are no active filters', () => {
            const actual = render(
                <ActiveFilters authorizedCarriers={[]} filters={{ ...baseFilters }} onReset={() => null} removeFilter={() => null} />
            );
            expect(actual.container).toBeEmptyDOMElement();
        });

        it('renders age chip', () => {
            render(
                <ActiveFilters
                    authorizedCarriers={[]}
                    filters={{ ...baseFilters, age: '14' }}
                    onReset={() => null}
                    removeFilter={() => null}
                />
            );

            expect(screen.getByText('ageRange : 14')).toBeInTheDocument();
            expect(screen.getByText('caseManagementDashboard.refineResultsOptions.clearAll')).toBeInTheDocument();
            expect(screen.getByText('ageRange : 14').parentElement?.parentElement).toHaveClass('bds-chip-x');
        });

        it('renders completed chip', () => {
            render(
                <ActiveFilters
                    filters={{ ...baseFilters, showOnlyCompletedCases: true, processTypes: new Set([]) }}
                    onReset={() => null}
                    removeFilter={() => null}
                    authorizedCarriers={[]}
                />
            );

            expect(screen.getByText('completed')).toBeInTheDocument();
            expect(screen.getByText('caseManagementDashboard.refineResultsOptions.clearAll')).toBeInTheDocument();
            expect(screen.getByText('completed').parentElement?.parentElement).toHaveClass('bds-chip-x');
        });

        it('renders canceled chip', () => {
            render(
                <ActiveFilters
                    authorizedCarriers={[]}
                    filters={{ ...baseFilters, showOnlyCanceledCases: true, processTypes: new Set([]) }}
                    onReset={() => null}
                    removeFilter={() => null}
                />
            );

            expect(screen.getByText('canceled')).toBeInTheDocument();
            expect(screen.getByText('caseManagementDashboard.refineResultsOptions.clearAll')).toBeInTheDocument();
            expect(screen.getByText('canceled').parentElement?.parentElement).toHaveClass('bds-chip-x');
        });

        it('renders updated start chip', () => {
            render(
                <ActiveFilters
                    authorizedCarriers={[]}
                    filters={{ ...baseFilters, updatedDateStart: '01-01-1990' }}
                    onReset={() => null}
                    removeFilter={() => null}
                />
            );

            expect(screen.getByText('dateUpdated: 1/1/1990')).toBeInTheDocument();
            expect(screen.getByText('caseManagementDashboard.refineResultsOptions.clearAll')).toBeInTheDocument();
            expect(screen.getByText('dateUpdated: 1/1/1990').parentElement?.parentElement).toHaveClass('bds-chip-x');
        });

        it('renders updated range chip', () => {
            render(
                <ActiveFilters
                    filters={{
                        ...baseFilters,
                        updatedDateStart: '01-01-1990',
                        updatedDateEnd: '02-01-1990',
                    }}
                    onReset={() => null}
                    removeFilter={() => null}
                    authorizedCarriers={[]}
                />
            );

            expect(screen.getByText('dateUpdated: 1/1/1990 - 2/1/1990')).toBeInTheDocument();
            expect(screen.getByText('caseManagementDashboard.refineResultsOptions.clearAll')).toBeInTheDocument();
            expect(screen.getByText('dateUpdated: 1/1/1990 - 2/1/1990').parentElement?.parentElement).toHaveClass('bds-chip-x');
        });

        it('renders created start chip', () => {
            render(
                <ActiveFilters
                    authorizedCarriers={[]}
                    filters={{ ...baseFilters, createdDateStart: '01-01-1990' }}
                    onReset={() => null}
                    removeFilter={() => null}
                />
            );

            expect(screen.getByText('dateCreated: 1/1/1990')).toBeInTheDocument();
            expect(screen.getByText('caseManagementDashboard.refineResultsOptions.clearAll')).toBeInTheDocument();
            expect(screen.getByText('dateCreated: 1/1/1990').parentElement?.parentElement).toHaveClass('bds-chip-x');
        });

        it('renders created range chip', () => {
            render(
                <ActiveFilters
                    authorizedCarriers={[]}
                    filters={{
                        ...baseFilters,
                        createdDateStart: '01-01-1990',
                        createdDateEnd: '02-01-1990',
                    }}
                    onReset={() => null}
                    removeFilter={() => null}
                />
            );

            expect(screen.getByText('dateCreated: 1/1/1990 - 2/1/1990')).toBeInTheDocument();
            expect(screen.getByText('caseManagementDashboard.refineResultsOptions.clearAll')).toBeInTheDocument();
            expect(screen.getByText('dateCreated: 1/1/1990 - 2/1/1990').parentElement?.parentElement).toHaveClass('bds-chip-x');
        });

        it('renders carrier chip', () => {
            render(
                <ActiveFilters
                    authorizedCarriers={['mass']}
                    filters={{ ...baseFilters, carriers: { mass: 'Mass Mutual' } }}
                    onReset={() => null}
                    removeFilter={() => null}
                />
            );

            expect(screen.getByText('Mass Mutual')).toBeInTheDocument();
            expect(screen.getByText('caseManagementDashboard.refineResultsOptions.clearAll')).toBeInTheDocument();
            expect(screen.getByText('Mass Mutual').parentElement?.parentElement).toHaveClass('bds-chip-x');
        });

        it('renders process chip', () => {
            render(
                <ActiveFilters
                    authorizedCarriers={[]}
                    filters={{ ...baseFilters, processTypes: new Set([Processes.NewBusiness]) }}
                    onReset={() => null}
                    removeFilter={() => null}
                />
            );

            expect(screen.getByText('New Business')).toBeInTheDocument();
            expect(screen.getByText('caseManagementDashboard.refineResultsOptions.clearAll')).toBeInTheDocument();
            expect(screen.getByText('New Business').parentElement?.parentElement).toHaveClass('bds-chip-x');
        });
    });

    describe('interactivity tests', () => {
        const mockRemoveFilter = jest.fn();

        afterEach(() => jest.clearAllMocks());

        it('removes filters with correct arguments for age chip', () => {
            render(
                <ActiveFilters
                    authorizedCarriers={[]}
                    filters={{ ...baseFilters, age: '14' }}
                    onReset={() => null}
                    removeFilter={mockRemoveFilter}
                />
            );

            expect(screen.getByText('ageRange : 14')).toBeInTheDocument();

            fireEvent.click(screen.getByTestId('bds-chip-x-button'));
            expect(mockRemoveFilter).toHaveBeenCalledTimes(1);
            expect(mockRemoveFilter).toHaveBeenCalledWith(expect.objectContaining({ age: '' }));
            waitFor(() => expect(screen.getAllByText('ageRange : 14')).not.toBeInTheDocument());
        });

        it('removes filters with correct arguments for completed chip', () => {
            render(
                <ActiveFilters
                    authorizedCarriers={[]}
                    filters={{ ...baseFilters, showOnlyCompletedCases: true }}
                    onReset={() => null}
                    removeFilter={mockRemoveFilter}
                />
            );

            expect(screen.getByText('completed')).toBeInTheDocument();
            fireEvent.click(screen.getByTestId('bds-chip-x-button'));
            expect(mockRemoveFilter).toHaveBeenCalledTimes(1);
            expect(mockRemoveFilter).toHaveBeenCalledWith(expect.objectContaining({ showOnlyCompletedCases: false }));
            waitFor(() => expect(screen.getAllByText('completed')).not.toBeInTheDocument());
        });

        it('removes filters with correct arguments for canceled chip', () => {
            render(
                <ActiveFilters
                    authorizedCarriers={[]}
                    filters={{ ...baseFilters, showOnlyCanceledCases: true }}
                    onReset={() => null}
                    removeFilter={mockRemoveFilter}
                />
            );

            expect(screen.getByText('canceled')).toBeInTheDocument();
            fireEvent.click(screen.getByTestId('bds-chip-x-button'));
            expect(mockRemoveFilter).toHaveBeenCalledTimes(1);
            expect(mockRemoveFilter).toHaveBeenCalledWith(expect.objectContaining({ showOnlyCanceledCases: false }));
            waitFor(() => expect(screen.getAllByText('canceled')).not.toBeInTheDocument());
        });

        it('removes filters with correct arguments for updated start chip', () => {
            render(
                <ActiveFilters
                    authorizedCarriers={[]}
                    filters={{ ...baseFilters, updatedDateStart: '01-01-1990' }}
                    onReset={() => null}
                    removeFilter={mockRemoveFilter}
                />
            );

            expect(screen.getByText('dateUpdated: 1/1/1990')).toBeInTheDocument();
            fireEvent.click(screen.getByTestId('bds-chip-x-button'));
            expect(mockRemoveFilter).toHaveBeenCalledTimes(1);
            expect(mockRemoveFilter).toHaveBeenCalledWith(expect.objectContaining({ updatedDateStart: '' }));
            waitFor(() => expect(screen.getAllByText('dateUpdated: 1/1/1990')).not.toBeInTheDocument());
        });

        it('removes filters with correct arguments for updated range chip', () => {
            render(
                <ActiveFilters
                    authorizedCarriers={[]}
                    filters={{
                        ...baseFilters,
                        updatedDateStart: '01-01-1990',
                        updatedDateEnd: '02-01-1990',
                    }}
                    onReset={() => null}
                    removeFilter={mockRemoveFilter}
                />
            );

            expect(screen.getByText('dateUpdated: 1/1/1990 - 2/1/1990')).toBeInTheDocument();
            fireEvent.click(screen.getByTestId('bds-chip-x-button'));
            expect(mockRemoveFilter).toHaveBeenCalledTimes(1);
            expect(mockRemoveFilter).toHaveBeenCalledWith(expect.objectContaining({ updatedDateStart: '', updatedDateEnd: '' }));
            waitFor(() => expect(screen.getAllByText('dateUpdated: 1/1/1990 - 2/1/1990')).not.toBeInTheDocument());
        });

        it('removes filters with correct arguments for created start chip', () => {
            render(
                <ActiveFilters
                    authorizedCarriers={[]}
                    filters={{ ...baseFilters, createdDateStart: '01-01-1990' }}
                    onReset={() => null}
                    removeFilter={mockRemoveFilter}
                />
            );

            expect(screen.getByText('dateCreated: 1/1/1990')).toBeInTheDocument();
            fireEvent.click(screen.getByTestId('bds-chip-x-button'));
            expect(mockRemoveFilter).toHaveBeenCalledTimes(1);
            expect(mockRemoveFilter).toHaveBeenCalledWith(expect.objectContaining({ createdDateStart: '' }));
            waitFor(() => expect(screen.getAllByText('dateCreated: 1/1/1990')).not.toBeInTheDocument());
        });

        it('removes filters with correct arguments for created range chip', () => {
            render(
                <ActiveFilters
                    authorizedCarriers={[]}
                    filters={{
                        ...baseFilters,
                        createdDateStart: '01-01-1990',
                        createdDateEnd: '02-01-1990',
                    }}
                    onReset={() => null}
                    removeFilter={mockRemoveFilter}
                />
            );

            expect(screen.getByText('dateCreated: 1/1/1990 - 2/1/1990')).toBeInTheDocument();
            fireEvent.click(screen.getByTestId('bds-chip-x-button'));
            expect(mockRemoveFilter).toHaveBeenCalledTimes(1);
            expect(mockRemoveFilter).toHaveBeenCalledWith(expect.objectContaining({ createdDateStart: '', createdDateEnd: '' }));
            waitFor(() => expect(screen.getAllByText('dateCreated: 1/1/1990 - 2/1/1990')).not.toBeInTheDocument());
        });

        it('removes filters with correct arguments for carrier chip', () => {
            render(
                <ActiveFilters
                    authorizedCarriers={['mass']}
                    filters={{ ...baseFilters, carriers: { mass: 'Mass Mutual' } }}
                    onReset={() => null}
                    removeFilter={mockRemoveFilter}
                />
            );

            expect(screen.getByText('Mass Mutual')).toBeInTheDocument();
            fireEvent.click(screen.getByTestId('bds-chip-x-button'));
            expect(mockRemoveFilter).toHaveBeenCalledTimes(1);
            expect(mockRemoveFilter).toHaveBeenCalledWith(expect.objectContaining({ carriers: {} }));
            waitFor(() => expect(screen.getAllByText('Mass Mutual')).not.toBeInTheDocument());
        });

        it('removes filters with correct arguments for process chip', () => {
            render(
                <ActiveFilters
                    authorizedCarriers={[]}
                    filters={{ ...baseFilters, processTypes: new Set([Processes.NewBusiness]) }}
                    onReset={() => null}
                    removeFilter={mockRemoveFilter}
                />
            );

            expect(screen.getByText('New Business')).toBeInTheDocument();
            fireEvent.click(screen.getByTestId('bds-chip-x-button'));
            expect(mockRemoveFilter).toHaveBeenCalledTimes(1);
            expect(mockRemoveFilter).toHaveBeenCalledWith(expect.objectContaining({ processTypes: new Set() }));
            waitFor(() => expect(screen.getAllByText('New Business')).not.toBeInTheDocument());
        });

        it('removes filters when clear all is clicked', () => {
            const mockReset = jest.fn();
            render(
                <ActiveFilters
                    authorizedCarriers={[]}
                    filters={{
                        ...baseFilters,
                        processTypes: new Set([Processes.NewBusiness]),
                        age: '14',
                        createdDateStart: '01-01-1990',
                    }}
                    onReset={mockReset}
                    removeFilter={mockRemoveFilter}
                />
            );

            expect(screen.getByText('New Business')).toBeInTheDocument();
            expect(screen.getByText('dateCreated: 1/1/1990')).toBeInTheDocument();
            expect(screen.getByText('ageRange : 14')).toBeInTheDocument();
            expect(screen.getByText('caseManagementDashboard.refineResultsOptions.clearAll')).toBeInTheDocument();
            fireEvent.click(screen.getByText('caseManagementDashboard.refineResultsOptions.clearAll'));

            expect(mockRemoveFilter).toHaveBeenCalledTimes(0);
            expect(mockReset).toHaveBeenCalledTimes(1);

            waitFor(() => expect(screen.getAllByText('caseType.New Business')).not.toBeInTheDocument());
            waitFor(() => expect(screen.getAllByText('dateCreated: 1/1/1990')).not.toBeInTheDocument());
            waitFor(() => expect(screen.getAllByText('ageRange : 14')).not.toBeInTheDocument());
            waitFor(() => expect(screen.getAllByText('caseManagementDashboard.refineResultsOptions.clearAll')).not.toBeInTheDocument());
        });
    });
});
