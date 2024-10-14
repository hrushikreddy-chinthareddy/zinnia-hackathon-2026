import { render, screen } from '@testing-library/react';

import { CellLink } from './cell-link';

describe('#CellLink', () => {
    it('should render the link with correct href and text', () => {
        const mockParams: any = {
            data: {
                taskInfoLink: 'https://example.com/task/1',
                taskId: '1',
            },
        };

        render(<CellLink {...mockParams} />);

        const linkElement = screen.getByText(mockParams.data.taskId);
        expect(linkElement).toBeInTheDocument();
        expect(linkElement).toHaveAttribute('href', mockParams.data.taskInfoLink);
    });
});
