import { render } from '@testing-library/react';
import React from 'react';

import { PiiWrapper } from '@deps/components/pii/PiiWrapper';

describe('PiiWrapper', () => {
    it('should always have data-ispii set to true', () => {
        const { getByTestId } = render(<PiiWrapper data-testid="pii-wrapper">Sensitive Content</PiiWrapper>);

        const wrapperElement = getByTestId('pii-wrapper');
        expect(wrapperElement).toHaveAttribute('data-ispii', 'true');
    });
});
