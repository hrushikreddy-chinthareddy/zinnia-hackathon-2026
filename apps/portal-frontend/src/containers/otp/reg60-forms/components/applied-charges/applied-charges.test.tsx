import { render, fireEvent, screen } from '@testing-library/react';

import AppliedCharges from './applied-charges';

describe('#AppliedCharges', () => {

    it('Should render applied charge component', () => {
        render(<AppliedCharges 
            checkboxLabel="Is surrender charge" 
            textInputLabel="Amount"
            onDataChange={() => {}} 
            isChecked={false}
        />);

        const isSurrenderCharge = screen.getByLabelText('Is surrender charge');
        expect(isSurrenderCharge).toBeInTheDocument();
        fireEvent.click(isSurrenderCharge);
        expect(isSurrenderCharge).toBeChecked();
        const amountField = screen.getByLabelText('Amount');
        expect(amountField).toBeInTheDocument();
    });

    it('it should show field value received from props', () => {
        const handleInputChange = jest.fn();

        render(<AppliedCharges 
            checkboxLabel="Is surrender charge" 
            textInputLabel="Amount" 
            onDataChange={handleInputChange} 
            amountValue={1000}
            isChecked={true}
        />);

        const isSurrenderCharge = screen.getByLabelText('Is surrender charge');
        expect(isSurrenderCharge).toBeInTheDocument();
        expect(isSurrenderCharge).toBeChecked();
        const amountField = screen.getByLabelText('Amount') as HTMLInputElement;
        expect(amountField).toBeInTheDocument();
        expect(amountField.value).toBe('1000');
    });

    it('should update field value as per users input', () => {
        const handleInputChange = jest.fn();

        render(<AppliedCharges 
            checkboxLabel="Is surrender charge" 
            textInputLabel="Amount" 
            onDataChange={handleInputChange} 
            amountValue={1000}
            isChecked={true}
        />);

        const isSurrenderCharge = screen.getByLabelText('Is surrender charge');
        expect(isSurrenderCharge).toBeInTheDocument();
        expect(isSurrenderCharge).toBeChecked();
        const amountField = screen.getByLabelText('Amount') as HTMLInputElement;
        expect(amountField).toBeInTheDocument();
        expect(amountField.value).toBe('1000');
        fireEvent.change(amountField, { target: { value: '1232435' } });
        expect(amountField.value).toBe('1232435');
    });

});
