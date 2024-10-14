import { render, screen } from '@testing-library/react';
import React from 'react';

import PageLoader from './page-loader';

describe('PageLoader', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<PageLoader />);
        expect(baseElement).toBeInTheDocument();
    });

    it('should have a spinning animation', () => {
        render(<PageLoader />);
        const loader = screen.getByTestId('test-loader');

        expect(loader).toBeInTheDocument();
        expect(loader).toHaveClass('animate-spin');
        expect(loader).toHaveClass('transform-origin-center');
        expect(loader).toHaveClass('duration-2000');
        expect(loader).toHaveClass('ease-linear');
    });

    it('should not have a text', () => {
        render(<PageLoader />);
        const loadingText = screen.queryByText('caseManagementDashboard.search.loading.title');
        expect(loadingText).not.toBeInTheDocument();
    });

    it('should have a text', () => {
        render(<PageLoader showText={true} />);
        const loadingText = screen.getByText('caseManagementDashboard.search.loading.title');
        expect(loadingText).toBeInTheDocument();
    });
});
