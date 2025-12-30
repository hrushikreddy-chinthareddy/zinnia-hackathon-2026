import { render, screen } from '@testing-library/react';

import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { Processes } from '@deps/models/case/case';

import CaseDetailsSideNav from './case-details-side-nav';

jest.mock('@deps/contexts/PermissionsContext', () => ({
    usePermissionsContext: jest.fn(),
}));

const mockUsePermissions = usePermissionsContext as jest.Mock;

describe('Case Details Side Nav Component', () => {
    beforeEach(() => {
        // default: allow showing Case Insights
        mockUsePermissions.mockReturnValue({ hasCaseInsightPermission: true });
        jest.spyOn(console, 'warn').mockImplementation();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should render Case Details Side Nav Component', () => {
        render(
            <CaseDetailsSideNav
                carrier="WELB"
                CaseAdditionalDetails={{}}
                process={Processes.AddressChange}
                applicationType="Electronic"
            />
        );
        expect(
            screen.getByText('sidenav.navButtons.caseDetails')
        ).toBeInTheDocument();
        expect(screen.getByText('sidenav.type')).toBeInTheDocument();
        expect(screen.getByText('sidenav.submissionType')).toBeInTheDocument();
        expect(screen.getByText('Address change')).toBeInTheDocument();
    });

    describe('for Quality Audit linked parent Case Details', () => {
        it('should display formatted parent case details when available', () => {
            render(
                <CaseDetailsSideNav
                    carrier="WELB"
                    CaseAdditionalDetails={{
                        caseCompletionDate: '2025-08-03T17:49:24.863918',
                        caseTransactionType: 'Agent Change',
                        caseId: 'CA00001234',
                    }}
                    process={Processes.QualityAudit}
                    applicationType="Electronic"
                />
            );
            expect(screen.getByText('Quality audit')).toBeInTheDocument();
            expect(screen.getByText('sidenav.caseId')).toBeInTheDocument();
            expect(screen.getByText('CA00001234')).toBeInTheDocument();

            expect(
                screen.getByText('sidenav.caseCompletionDate')
            ).toBeInTheDocument();
            expect(screen.getByText('8/3/2025')).toBeInTheDocument();

            expect(
                screen.getByText('sidenav.caseTransactionType')
            ).toBeInTheDocument();
            expect(screen.getByText('Agent change')).toBeInTheDocument();
        });

        it('should not display parent case details when unavailable', () => {
            render(
                <CaseDetailsSideNav
                    carrier="WELB"
                    CaseAdditionalDetails={{}}
                    process={Processes.QualityAudit}
                    applicationType="Electronic"
                />
            );
            expect(screen.getByText('Quality audit')).toBeInTheDocument();
            expect(
                screen.queryByText('sidenav.caseId')
            ).not.toBeInTheDocument();
            expect(
                screen.queryByText('sidenav.caseCompletionDate')
            ).not.toBeInTheDocument();
            expect(
                screen.queryByText('sidenav.caseTransactionType')
            ).not.toBeInTheDocument();
        });
    });

    describe('Estimated Completion field', () => {
        it('should display estimated completion when valid timestamp is provided', () => {
            render(
                <CaseDetailsSideNav
                    carrier="WELB"
                    CaseAdditionalDetails={{}}
                    process={Processes.NewBusiness}
                    applicationType="Electronic"
                    estimatedCompletionAt="2025-10-26T18:26:51.588417Z"
                />
            );

            expect(
                screen.getByText('sidenav.estimatedCompletion')
            ).toBeInTheDocument();
            // The formatted date will depend on the user's timezone
            // Just verify the field exists
            expect(
                screen.getByText(/\d{1,2}\/\d{1,2}\/\d{4}/)
            ).toBeInTheDocument();
        });

        it('should not display estimated completion field when value is null', () => {
            render(
                <CaseDetailsSideNav
                    carrier="WELB"
                    CaseAdditionalDetails={{}}
                    process={Processes.NewBusiness}
                    applicationType="Electronic"
                    estimatedCompletionAt={null}
                />
            );

            expect(
                screen.queryByText('sidenav.estimatedCompletion')
            ).not.toBeInTheDocument();
        });

        it('should not display estimated completion field when value is undefined', () => {
            render(
                <CaseDetailsSideNav
                    carrier="WELB"
                    CaseAdditionalDetails={{}}
                    process={Processes.NewBusiness}
                    applicationType="Electronic"
                />
            );

            expect(
                screen.queryByText('sidenav.estimatedCompletion')
            ).not.toBeInTheDocument();
        });

        it('should handle invalid date strings gracefully', () => {
            render(
                <CaseDetailsSideNav
                    carrier="WELB"
                    CaseAdditionalDetails={{}}
                    process={Processes.NewBusiness}
                    applicationType="Electronic"
                    estimatedCompletionAt="invalid-date-string"
                />
            );

            // Even with invalid date, the field should render because formatTimestamp
            // handles invalid dates by returning DEFAULT_ERROR_STRING
            expect(
                screen.getByText('sidenav.estimatedCompletion')
            ).toBeInTheDocument();
        });
        it('should hide estimated completion when permission is false', () => {
            mockUsePermissions.mockReturnValueOnce({
                hasCaseInsightPermission: false,
            });

            render(
                <CaseDetailsSideNav
                    carrier="WELB"
                    CaseAdditionalDetails={{}}
                    process={Processes.NewBusiness}
                    applicationType="Electronic"
                    estimatedCompletionAt="2025-10-26T18:26:51.588417Z"
                />
            );

            expect(
                screen.queryByText('sidenav.estimatedCompletion')
            ).not.toBeInTheDocument();
        });
    });
});
