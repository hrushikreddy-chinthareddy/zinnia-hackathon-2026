import { render, screen } from '@testing-library/react';

import { PermissionsProvider } from '@deps/contexts/PermissionsContext';
import { PolicySearchFiltersProvider } from '@deps/contexts/PolicySearchFilters';

import SideSheetRefineResults from './side-sheet-refine-results';

const permissionsObject: { [key: string]: string[] } = {
    testing: ['policy:read'],
};
const baseFilters = {
    processTypes: new Set([]),
    requestSubType: new Set([]),
    products: new Set([]),
};

const authorizedCarriers = ['one', 'two', 'three'];

jest.mock('@auth0/nextjs-auth0/client', () => ({
    useUser: () => ({ user: { 'undefined/permissions': permissionsObject } }),
}));

jest.mock('@deps/utils/server-logging');

describe.skip('Refine Results Sidesheet', () => {
    it('renders correctly ', () => {
        render(
            <PermissionsProvider>
                <PolicySearchFiltersProvider>
                    <SideSheetRefineResults
                        authorizedCarriers={authorizedCarriers}
                        filters={baseFilters}
                        setCaseManagementFilters={() => null}
                        closeSideSheet={() => null}
                    />
                </PolicySearchFiltersProvider>
            </PermissionsProvider>
        );

        expect(
            screen.getByText(
                'caseManagementDashboard.refineResultsOptions.carrier'
            )
        ).toBeInTheDocument();
        expect(screen.getByText('TESTING')).toBeInTheDocument();
        expect(
            screen.getByText(
                'caseManagementDashboard.refineResultsOptions.processType'
            )
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'caseManagementDashboard.refineResultsFilters.caseType.New Business'
            )
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'caseManagementDashboard.refineResultsFilters.caseType.Renewal'
            )
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'caseManagementDashboard.refineResultsFilters.caseType.Withdrawal'
            )
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'caseManagementDashboard.refineResultsOptions.createdStart'
            )
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'caseManagementDashboard.refineResultsOptions.createdEnd'
            )
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'caseManagementDashboard.refineResultsOptions.updatedStart'
            )
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'caseManagementDashboard.refineResultsOptions.updatedEnd'
            )
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'caseManagementDashboard.refineResultsOptions.selectDayRange'
            )
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'caseManagementDashboard.refineResultsOptions.clearAll'
            )
        ).toBeInTheDocument();
    });
    it('disables the pre-populated carrier dropdown with only one carrier', () => {
        render(
            <PermissionsProvider>
                <PolicySearchFiltersProvider>
                    <SideSheetRefineResults
                        authorizedCarriers={authorizedCarriers}
                        filters={baseFilters}
                        setCaseManagementFilters={() => null}
                        closeSideSheet={() => null}
                    />
                </PolicySearchFiltersProvider>
            </PermissionsProvider>
        );

        expect(screen.getByText('TESTING')).toBeInTheDocument();
        expect(
            screen.queryByText(
                'caseManagementDashboard.refineResultsOptions.selectCarrier'
            )
        ).not.toBeInTheDocument();
        expect(screen.getByTestId('carrier-dropdown-btn')).toHaveAttribute(
            'data-disabled'
        );
        expect(screen.getByTestId('carrier-dropdown-btn')).toHaveAttribute(
            'disabled'
        );
    });

    it('enables the carrier dropdown with more than one carrier', () => {
        permissionsObject['second'] = ['policy:read'];

        render(
            <PermissionsProvider>
                <PolicySearchFiltersProvider>
                    <SideSheetRefineResults
                        authorizedCarriers={authorizedCarriers}
                        filters={baseFilters}
                        setCaseManagementFilters={() => null}
                        closeSideSheet={() => null}
                    />
                </PolicySearchFiltersProvider>
            </PermissionsProvider>
        );

        expect(screen.queryByText('TESTING')).not.toBeInTheDocument();
        expect(
            screen.getByText(
                'caseManagementDashboard.refineResultsOptions.selectCarrier'
            )
        ).toBeInTheDocument();
        expect(screen.getByTestId('carrier-dropdown-btn')).not.toHaveAttribute(
            'data-disabled'
        );
        expect(screen.getByTestId('carrier-dropdown-btn')).not.toHaveAttribute(
            'disabled'
        );
    });
});
