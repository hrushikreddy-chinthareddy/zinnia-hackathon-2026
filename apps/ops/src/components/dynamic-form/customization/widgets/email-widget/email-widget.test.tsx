import { render, screen, fireEvent } from '@testing-library/react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import EmailWidget from './email-widget';
import { widgetRegistryMock } from '../widgetMocks';

i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
        en: {
            translation: {
                hello: 'Hello World',
            },
        },
    },
    interpolation: { escapeValue: false },
});

describe('Email Widget', () => {
    it('should render Email Widget with default input value', () => {
        render(
            <EmailWidget
                value="abc@mail.com"
                label="Email Address"
                uiSchema={{}}
                formContext={{}}
                schema={{}}
                disabled={false}
                readonly={false}
                onChange={jest.fn()}
                onBlur={jest.fn()}
                onFocus={jest.fn()}
                id="test"
                options={{}}
                required={false}
                rawErrors={[]}
                name={''}
                registry={widgetRegistryMock}
            />
        );
        const input = screen
            .getByTestId('field-input-test-id')
            .querySelector('input');
        expect(input).toHaveValue('abc@mail.com');
    });

    it('should display email value in readonly view', () => {
        render(
            <EmailWidget
                value="abc@mail.com"
                label="Email Address"
                uiSchema={{}}
                formContext={{}}
                schema={{}}
                disabled={false}
                readonly={true}
                onChange={jest.fn()}
                onBlur={jest.fn()}
                onFocus={jest.fn()}
                id="test"
                options={{}}
                required={false}
                rawErrors={[]}
                name={''}
                registry={widgetRegistryMock}
            />
        );
        expect(screen.getByText('abc@mail.com')).toBeInTheDocument();
    });

    it('should disable Email widget when "disabled" prop is true', () => {
        render(
            <EmailWidget
                value="abc@mail.com"
                label="Email Address"
                uiSchema={{}}
                formContext={{}}
                schema={{}}
                disabled={true}
                readonly={false}
                onChange={jest.fn()}
                onBlur={jest.fn()}
                onFocus={jest.fn()}
                id="test"
                options={{}}
                required={false}
                rawErrors={[]}
                name={''}
                registry={widgetRegistryMock}
            />
        );
        const emailInput = screen.getByTestId('field-input-test-id');
        expect(emailInput).toHaveClass('bg-gray-100 pointer-events-none');
    });

    it('should trigger handleChange on input change', () => {
        const handleChange = jest.fn();
        render(
            <EmailWidget
                value=""
                label="Email"
                uiSchema={{}}
                formContext={{}}
                schema={{}}
                disabled={false}
                readonly={false}
                onChange={handleChange}
                onBlur={jest.fn()}
                onFocus={jest.fn()}
                id="test"
                options={{}}
                required={false}
                rawErrors={[]}
                name={''}
                registry={widgetRegistryMock}
            />
        );
        const emailInput = screen
            .getByTestId('field-input-test-id')
            .querySelector('input') as HTMLInputElement;
        expect(emailInput).toHaveValue('');

        fireEvent.change(emailInput, { target: { value: 'xyz@mail.com' } });
        expect(handleChange).toHaveBeenCalledTimes(1);

        fireEvent.change(emailInput, { target: { value: ' ' } });
        expect(handleChange).toHaveBeenCalledTimes(2);
    });
});
