import { render } from '@testing-library/react';

import Title, { TitleVariant } from './title';

describe('Title component', () => {
    it('renders the title with default variant', () => {
        const { getByText } = render(<Title variant={TitleVariant.SubTitle}>Hello peeps!</Title>);
        const titleElement = getByText('Hello peeps!');

        expect(titleElement).toBeInTheDocument();
        expect(titleElement).toHaveClass('font-primary text-[18px] text-gray-900');
        expect(titleElement).toHaveClass('font-semibold');
        expect(titleElement).not.toHaveClass('font-normal');
    });

    it('renders the title with custom variant', () => {
        const { getByText } = render(<Title variant={TitleVariant.SubTitleAlt}>Hello peeps!</Title>);
        const titleElement = getByText('Hello peeps!');

        expect(titleElement).toBeInTheDocument();
        expect(titleElement).toHaveClass('font-primary text-[18px] text-gray-900');
        expect(titleElement).toHaveClass('font-normal');
        expect(titleElement).not.toHaveClass('font-semibold');
    });

    it('renders the title with custom className', () => {
        const { getByText } = render(<Title className="custom-title">Hello peeps!</Title>);
        const titleElement = getByText('Hello peeps!');

        expect(titleElement).toBeInTheDocument();
        expect(titleElement).toHaveClass('font-primary text-[18px] text-gray-900');
        expect(titleElement).toHaveClass('custom-title');
    });
});
