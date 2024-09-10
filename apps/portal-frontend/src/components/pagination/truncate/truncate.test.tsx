import '@testing-library/jest-dom';
import { cleanup, render } from '@testing-library/react';

import Truncate from './truncate';

afterEach(cleanup);

describe('Truncate', () => {
    it('should render', () => {
        const { getByTestId } = render(<Truncate />);

        const truncate = getByTestId('truncate');
        expect(truncate).toBeInTheDocument();
    });
});
