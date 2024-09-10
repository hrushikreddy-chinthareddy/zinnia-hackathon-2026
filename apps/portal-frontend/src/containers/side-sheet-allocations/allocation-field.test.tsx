import { render, fireEvent } from '@testing-library/react';
import React from 'react';

import { TypographyVariant } from '@deps/components/typography/typography';
import { generateParty } from '@deps/utils/mock/mockParty';

import AllocationField, { AllocationFieldProps } from './allocation-field';

const mockParty = generateParty('party-time');

describe('allocation-field', () => {
    const mockOnChange = jest.fn();
    const mockOnBlur = jest.fn();
    let props: AllocationFieldProps;
    const beneficiaryPercentage = mockParty.beneficiaryPercentage;
    const firstLastName = `${mockParty.firstName} ${mockParty.lastName}`;
    const onBlur = mockOnBlur;
    const onChange = mockOnChange;
    const partyId = mockParty.partyId;
    const partyLabelVariant = TypographyVariant.LabelLgAlt;

    beforeEach(() => {
        props = {
            beneficiaryPercentage,
            firstLastName,
            onBlur,
            onChange,
            partyId,
            partyLabelVariant,
        };
    });

    const renderComponent = () => render(<AllocationField {...props} />);

    it('renders', () => {
        const { getByText } = renderComponent();

        expect(getByText(firstLastName)).toBeInTheDocument();
    });

    it('displays the generic label for the first item', () => {
        const { getByLabelText } = renderComponent();

        expect(getByLabelText('ariaLabel.genericInput')).toBeInTheDocument();
    });

    it('displays the allocation label for the first item', () => {
        props.isFirst = true;
        const { queryByText } = renderComponent();

        expect(queryByText('sideSheet.allocation.allocation')).toBeInTheDocument();
    });

    it('handles input field blur', () => {
        const { getByLabelText } = renderComponent();

        const input = getByLabelText('ariaLabel.genericInput');
        fireEvent.blur(input);

        expect(mockOnBlur).toHaveBeenCalled();
    });

    it('handles input field changes', () => {
        const { getByLabelText } = renderComponent();

        const input = getByLabelText('ariaLabel.genericInput');
        fireEvent.change(input, { target: { value: '60' } });

        expect(mockOnChange).toHaveBeenCalled();
    });

    it('passes partyID to label', () => {
        const { getByText } = renderComponent();
        const labelElement = getByText(firstLastName).parentElement;
        expect(labelElement).toHaveAttribute('id', `allocationField-${partyId}`);
    });

    it('passes value to input field value', () => {
        const { getByLabelText } = renderComponent();
        const input = getByLabelText('ariaLabel.genericInput');
        const expectedValue = String(beneficiaryPercentage);
        expect(input).toHaveValue(expectedValue);
    });
});
