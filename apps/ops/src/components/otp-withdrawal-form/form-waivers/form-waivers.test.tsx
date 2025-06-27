import { render, fireEvent, screen } from '@testing-library/react';

import {
    FormDataContext,
    defaultFormDataContext,
} from '@deps/contexts/OtpWithdrawalFormContext';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import {
    FormAdditionalWaiver,
    PolicyWaiver,
} from '@deps/models/case/withdrawal/case';

import FormWaivers, { WaiverItemConfig } from './form-waivers';

const getStandardOptions = (index: string) => [
    { label: `yes-${index}`, value: 'true' },
    { label: `no-${index}`, value: 'false' },
];

const config: WaiverItemConfig[] = [
    {
        id: PolicyWaiver.NURSING_HOME_AND_HOSPITAL,
        title: 'Title 1',
        optionTitle: 'Option 1',
        options: getStandardOptions('1'),
    },
    {
        id: PolicyWaiver.TERMINAL_ILLNESS,
        title: 'Title 2',
        optionTitle: 'Option 2',
        options: getStandardOptions('2'),
    },
];

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: DEFAULT_LOCALE,
        },
    }),
}));

describe('FormWaivers Component', () => {
    test('should render required checkboxes for additional waiver', () => {
        render(<FormWaivers config={config} />);

        const checkbox1: HTMLInputElement = screen.getByTestId(
            'NURSING_HOME_AND_HOSPITAL-checkbox'
        );
        const checkbox2: HTMLInputElement = screen.getByTestId(
            'TERMINAL_ILLNESS-checkbox'
        );

        expect(checkbox1.checked).toBe(false);
        expect(checkbox2.checked).toBe(false);
    });

    test('should render required button group for checkboxes in additional waiver', () => {
        render(<FormWaivers config={config} />);

        const checkbox1: HTMLInputElement = screen.getByTestId(
            'NURSING_HOME_AND_HOSPITAL-checkbox'
        );
        const checkbox2: HTMLInputElement = screen.getByTestId(
            'TERMINAL_ILLNESS-checkbox'
        );

        expect(checkbox1.checked).toBe(false);
        fireEvent.click(checkbox1);
        expect(checkbox1.checked).toBe(true);
        const optionYes: HTMLInputElement = screen.getByTestId(
            'button-group-label-test-id-yes-1'
        );
        const optionNo: HTMLInputElement = screen.getByTestId(
            'button-group-label-test-id-no-1'
        );
        expect(optionYes).toBeInTheDocument();
        expect(optionNo).toBeInTheDocument();

        expect(checkbox2.checked).toBe(false);
    });

    test('should add a first additional waiver item without Yes/No selected', () => {
        const formAdditionalWaivers: FormAdditionalWaiver[] = [];
        let setMethodArgs;
        const setMockData = jest.fn((cb) => {
            setMethodArgs = cb(formAdditionalWaivers);
            return setMethodArgs;
        });

        render(
            <FormDataContext.Provider
                value={{
                    ...defaultFormDataContext,
                    formAdditionalWaivers,
                    setFormAdditionalWaivers: setMockData,
                }}
            >
                <FormWaivers config={config} />
            </FormDataContext.Provider>
        );

        const checkbox: HTMLInputElement = screen.getByTestId(
            'TERMINAL_ILLNESS-checkbox'
        );
        expect(checkbox.checked).toBe(false);
        fireEvent.click(checkbox);

        expect(setMethodArgs).toEqual([
            {
                text: PolicyWaiver.TERMINAL_ILLNESS,
                selectionOptions: {
                    isValid: {
                        text: null,
                    },
                },
            },
        ]);
    });

    test('should add a first additional waiver item with Yes/No selected', () => {
        const formAdditionalWaivers: FormAdditionalWaiver[] = [];
        let setMethodArgs;
        const setMockData = jest.fn((cb) => {
            setMethodArgs = cb(formAdditionalWaivers);
            return setMethodArgs;
        });

        render(
            <FormDataContext.Provider
                value={{
                    ...defaultFormDataContext,
                    formAdditionalWaivers,
                    setFormAdditionalWaivers: setMockData,
                }}
            >
                <FormWaivers config={config} />
            </FormDataContext.Provider>
        );

        const checkbox: HTMLInputElement = screen.getByTestId(
            'TERMINAL_ILLNESS-checkbox'
        );
        expect(checkbox.checked).toBe(false);
        fireEvent.click(checkbox);

        const optionNo: HTMLInputElement = screen.getByTestId(
            'button-group-label-test-id-yes-2'
        );
        expect(optionNo).toBeInTheDocument();
        fireEvent.click(optionNo);

        expect(setMethodArgs).toEqual([
            {
                text: PolicyWaiver.TERMINAL_ILLNESS,
                selectionOptions: {
                    isValid: {
                        text: true,
                    },
                },
            },
        ]);
    });

    test('should add a new additional waiver item with Yes/No selected', () => {
        const formAdditionalWaivers: FormAdditionalWaiver[] = [
            {
                text: PolicyWaiver.NURSING_HOME_AND_HOSPITAL,
                selectionOptions: {
                    isValid: {
                        text: true,
                    },
                },
            },
        ];

        let setMethodArgs;
        const setMockData = jest.fn((cb) => {
            setMethodArgs = cb(formAdditionalWaivers);
            return setMethodArgs;
        });

        render(
            <FormDataContext.Provider
                value={{
                    ...defaultFormDataContext,
                    formAdditionalWaivers,
                    setFormAdditionalWaivers: setMockData,
                }}
            >
                <FormWaivers config={config} />
            </FormDataContext.Provider>
        );

        const optionNo: HTMLInputElement = screen.getByTestId(
            'button-group-label-test-id-no-1'
        );
        expect(optionNo).toBeInTheDocument();
        fireEvent.click(optionNo);

        expect(setMethodArgs).toEqual([
            {
                text: PolicyWaiver.NURSING_HOME_AND_HOSPITAL,
                selectionOptions: {
                    isValid: {
                        text: false,
                    },
                },
            },
        ]);
    });

    test('should update additional waiver item for option (Yes/No) value', () => {
        const formAdditionalWaivers: FormAdditionalWaiver[] = [
            {
                text: PolicyWaiver.NURSING_HOME_AND_HOSPITAL,
                selectionOptions: {
                    isValid: {
                        text: true,
                    },
                },
            },
            {
                text: PolicyWaiver.TERMINAL_ILLNESS,
                selectionOptions: {
                    isValid: {
                        text: null,
                    },
                },
            },
        ];

        let setMethodArgs;
        const setMockData = jest.fn((cb) => {
            setMethodArgs = cb(formAdditionalWaivers);
            return setMethodArgs;
        });

        render(
            <FormDataContext.Provider
                value={{
                    ...defaultFormDataContext,
                    formAdditionalWaivers,
                    setFormAdditionalWaivers: setMockData,
                }}
            >
                <FormWaivers config={config} />
            </FormDataContext.Provider>
        );

        const checkbox: HTMLInputElement = screen.getByTestId(
            'TERMINAL_ILLNESS-checkbox'
        );
        expect(checkbox.checked).toBe(true);

        const optionNo: HTMLInputElement = screen.getByTestId(
            'button-group-label-test-id-no-2'
        );
        expect(optionNo).toBeInTheDocument();
        fireEvent.click(optionNo);

        expect(setMethodArgs).toEqual([
            {
                text: PolicyWaiver.NURSING_HOME_AND_HOSPITAL,
                selectionOptions: {
                    isValid: {
                        text: true,
                    },
                },
            },
            {
                text: PolicyWaiver.TERMINAL_ILLNESS,
                selectionOptions: {
                    isValid: {
                        text: false,
                    },
                },
            },
        ]);
    });
});
