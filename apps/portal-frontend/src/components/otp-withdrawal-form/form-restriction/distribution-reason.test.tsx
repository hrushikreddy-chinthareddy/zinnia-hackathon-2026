import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import { FormDataContext, defaultFormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { EmergencyOption, RestrictionOption } from '@deps/models/case/withdrawal/case';

import { Description } from './description';
import { ReasonDate } from './reason-date';

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: DEFAULT_LOCALE,
        },
    }),
}));

describe('Distribution-reason component', () => {
    it('should not render a date when selected RestrictionOption.Age595', () => {
        const formRestriction = {
            emergency: [],
            restrictions: [{ text: RestrictionOption.Age595, selectionOptions: {} }],
            hardship: [],
        };
        let callbackVariable;
        const setFormRestriction = jest.fn(cb => {
            callbackVariable = cb(formRestriction);
            return callbackVariable;
        });

        render(
            <FormDataContext.Provider value={{ ...defaultFormDataContext, formRestriction, setFormRestriction }}>
                <ReasonDate />
            </FormDataContext.Provider>
        );

        const dateElement = screen.queryByTestId('field-container-test-id');

        expect(dateElement).not.toBeInTheDocument();

        expect(setFormRestriction).toHaveReturnedWith({
            ...formRestriction,
            restrictions: [
                {
                    text: RestrictionOption.Age595,
                    selectionOptions: {},
                },
            ],
        });
    });
    it('should render a date when selected RestrictionOption.Severance', () => {
        const formRestriction = {
            emergency: [],
            restrictions: [{ text: RestrictionOption.Severance, selectionOptions: {} }],
            hardship: [],
        };
        let callbackVariable;
        const setFormRestriction = jest.fn(cb => {
            callbackVariable = cb(formRestriction);
            return callbackVariable;
        });

        render(
            <FormDataContext.Provider value={{ ...defaultFormDataContext, formRestriction, setFormRestriction }}>
                <ReasonDate />
            </FormDataContext.Provider>
        );

        const dateElement = screen.getByTestId('field-container-test-id');

        const dateInput = dateElement.querySelector('[inputmode="numeric"]');
        if (dateInput !== null) {
            fireEvent.change(dateInput, { target: { value: '03262024' } });
        }
        expect(dateElement).toBeInTheDocument();

        expect(setFormRestriction).toHaveReturnedWith({
            ...formRestriction,
            restrictions: [
                {
                    text: RestrictionOption.Severance,
                    selectionOptions: {
                        SeveranceDate: {
                            text: '2024-03-26',
                        },
                    },
                },
            ],
        });
    });

    it('should not render a textarea when selected EmergencyOption.LossOfProperty', () => {
        const formRestriction = {
            emergency: [{ text: EmergencyOption.LossOfProperty, selectionOptions: {} }],
            restrictions: [],
            hardship: [],
        };
        let callbackVariable;
        const setFormRestriction = jest.fn(cb => {
            callbackVariable = cb(formRestriction);
            return callbackVariable;
        });

        render(
            <FormDataContext.Provider value={{ ...defaultFormDataContext, formRestriction, setFormRestriction }}>
                <Description />
            </FormDataContext.Provider>
        );
        const descriptionElement = screen.queryByTestId('data-testid-detailed-description') as HTMLInputElement;
        expect(descriptionElement).not.toBeInTheDocument();

        expect(setFormRestriction).toHaveReturnedWith({
            ...formRestriction,
            emergency: [
                {
                    text: EmergencyOption.LossOfProperty,
                    selectionOptions: {},
                },
            ],
        });
    });
    it('should render a textarea when selected EmergencyOption.BeyondControl', () => {
        const formRestriction = {
            emergency: [{ text: EmergencyOption.BeyondControl, selectionOptions: {} }],
            restrictions: [],
            hardship: [],
        };
        let callbackVariable;
        const setFormRestriction = jest.fn(cb => {
            callbackVariable = cb(formRestriction);
            return callbackVariable;
        });

        render(
            <FormDataContext.Provider value={{ ...defaultFormDataContext, formRestriction, setFormRestriction }}>
                <Description />
            </FormDataContext.Provider>
        );
        const descriptionElement = screen.getByTestId('data-testid-detailed-description') as HTMLInputElement;
        expect(descriptionElement).toBeInTheDocument();

        fireEvent.change(descriptionElement, { target: { value: 'Lorem ipsum' } });
        expect(descriptionElement.value).toBe('Lorem ipsum');

        expect(setFormRestriction).toHaveReturnedWith({
            ...formRestriction,
            emergency: [
                {
                    text: EmergencyOption.BeyondControl,
                    selectionOptions: {
                        DistribUnforseenDesc: {
                            text: 'Lorem ipsum',
                        },
                    },
                },
            ],
        });
    });
});
