import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

import { NestedNavDrawerTest } from '@deps/jest/constants/test-id-constants';

import { EndIcon, EndIconProps } from './nested-nav-end-icon';

describe('EndIcon', () => {
    const mockProps: EndIconProps = {
        isExpanded: true,
    };

    it('renders the icon correctly when expanded', () => {
        const { getByTestId } = render(<EndIcon {...mockProps} />);

        const endIconSpan = getByTestId(NestedNavDrawerTest.END_ICON);

        expect(endIconSpan).toBeInTheDocument();
        expect(endIconSpan.firstChild).toHaveAttribute('width', '12');
        expect(endIconSpan.firstChild).toHaveAttribute('height', '12');
        expect(endIconSpan.firstChild).toHaveClass('flip180');
    });

    it('renders the icon correctly when NOT expanded', () => {
        const { getByTestId } = render(<EndIcon />);

        const endIconSpan = getByTestId(NestedNavDrawerTest.END_ICON);

        expect(endIconSpan).toBeInTheDocument();
        expect(endIconSpan.firstChild).toHaveAttribute('width', '12');
        expect(endIconSpan.firstChild).toHaveAttribute('height', '12');
        expect(endIconSpan.firstChild).not.toHaveClass('flip180');
    });
});
