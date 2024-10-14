import { fireEvent, render, screen } from '@testing-library/react';

import ProposedAnnuityQuote from './proposed-annuity-quote';

describe('ProposedAnnuityQuote', () => {
    it('should render proposed annuity component', () => {
        const formConfig = {
            fields: {
                proposedAnnuityQuote: { title: 'Proposed Annuity Quote' },
                annuitizationQuote: { title: 'Annuitization Quote' },
                annuityPaymentAmount: { fieldLabel: 'Annuity Payment Amount', isRequired: true },
                firstPaymentDate: { fieldLabel: 'First Payment Date', isRequired: true },
                paymentFrequency: { fieldLabel: 'Payment Frequency', isRequired: true },
                paymentFrequencyText: { fieldLabel: 'Payment Frequency Text', isRequired: true },
                incomeOption: { fieldLabel: 'Income Option', isRequired: true },
                incomeOptionText: { fieldLabel: 'Income Option Text', isRequired: true },
                periodCertainYears: { fieldLabel: 'Period Certain Years', isRequired: true },
                typeOfPayment: {
                    fieldLabel: 'Type of Payment',
                    isRequired: true,
                    selectOptions: [
                        { label: 'Option 1', value: 'option1' },
                        { label: 'Option 2', value: 'option2' },
                    ],
                },
            },
        };
        render(
            <ProposedAnnuityQuote
                annuityQuote={{} as any}
                onAnnuityQuoteChange={() => {}}
                formConfig={formConfig as any}
                product="retireEase"
            />
        );

        const component = screen.getByTestId('proposed-annuity-container');
        expect(component).toBeInTheDocument();
    });

    it('should handle invalid date formats gracefully', () => {
        const onAnnuityQuoteChange = jest.fn();
        const initialAnnuityQuote = {
            firstPaymentDate: '1000000',
        } as any;
        const formConfig = {
            fields: {
                firstPaymentDate: { fieldLabel: 'First Payment Date', isRequired: true },
            },
        };
        render(
            <ProposedAnnuityQuote
                annuityQuote={initialAnnuityQuote}
                onAnnuityQuoteChange={onAnnuityQuoteChange}
                formConfig={formConfig as any}
                product="retireEase"
            />
        );

        fireEvent.change(screen.getByLabelText(formConfig.fields.firstPaymentDate.fieldLabel), { target: { value: 'invalid-date' } });

        expect(onAnnuityQuoteChange).not.toHaveBeenCalledWith(
            expect.objectContaining({
                firstPaymentDate: expect.any(String),
            })
        );
    });
});
