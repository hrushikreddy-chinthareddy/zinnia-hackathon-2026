import { render } from '@testing-library/react';
import { RefObject } from 'react';

import FieldClear from './field-clear';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const testProps = {
    onChange: noop,
    value: '',
    label: 'First Name',
    inputRef: null as any as RefObject<HTMLInputElement>,
};

describe('CallLogCard', () => {
    it('renders null when there is no value', () => {
        const { container } = render(<FieldClear {...testProps} />);

        expect(container).toBeEmptyDOMElement();
    });

    it('renders with correct aria-label when there is a value', () => {
        const mockRef = {
            current: document.createElement('input'),
        };

        const { getByLabelText } = render(<FieldClear {...testProps} value="test value" inputRef={mockRef} />);

        expect(getByLabelText('ariaLabel.clearInput')).toBeInTheDocument();
    });
});
