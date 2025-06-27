import { render, screen } from '@testing-library/react';

import PageLoader from './page-loader';

describe('PageLoader', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<PageLoader />);
        expect(baseElement).toBeInTheDocument();
    });

    it('should not have a text', () => {
        render(<PageLoader />);
        const loadingText = screen.queryByText(
            'caseManagementDashboard.search.loading.title'
        );
        expect(loadingText).not.toBeInTheDocument();
    });

    it('should have a text', () => {
        render(<PageLoader showText={true} />);
        const loadingText = screen.getByText(
            'caseManagementDashboard.search.loading.title'
        );
        expect(loadingText).toBeInTheDocument();
    });
});
