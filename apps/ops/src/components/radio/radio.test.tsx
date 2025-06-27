import { fireEvent, render } from '@testing-library/react';

import { RadioTest } from '@deps/jest/constants/test-id-constants';

import Radio from './radio';

describe('Radio Component', () => {
    const items = [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
        { label: 'Option 3', value: 'option3' },
    ];

    it('renders Radio component correctly', () => {
        const onChangeMock = jest.fn();
        const { getByTestId } = render(
            <Radio
                label="Radio Options"
                items={items}
                value="option1"
                onChange={onChangeMock}
            />
        );
        const radioComponent = getByTestId(RadioTest.Radio);

        expect(radioComponent).toBeInTheDocument();
    });

    it('calls onChange when a radio button is selected using Enter key', () => {
        const onChangeMock = jest.fn();
        const { getByLabelText } = render(
            <Radio
                label="Radio Options"
                items={items}
                value="option1"
                onChange={onChangeMock}
            />
        );

        fireEvent.keyDown(getByLabelText('Option 3'), {
            key: 'Enter',
            keyCode: 13,
        });

        expect(onChangeMock).toBeCalledTimes(1);
    });

    it('calls onChange when a radio button is clicked', () => {
        const onChangeMock = jest.fn();
        const { getByLabelText } = render(
            <Radio
                label="Radio Options"
                items={items}
                value="option1"
                onChange={onChangeMock}
            />
        );

        fireEvent.click(getByLabelText('Option 2'));

        expect(onChangeMock).toBeCalledTimes(1);
    });
});
