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

const uiSchema = {
    'ui:options': {
        label: false,
    },
};

describe('Email Widget', () => {
    it('should render email field with label', () => {
        render(
            <EmailWidget
                value="abc@mail.com"
                label="Email"
                uiSchema={uiSchema}
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
        expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('should display tooltip on click of email tooltip button', () => {
        render(
            <EmailWidget
                value="abc@mail.com"
                label="Email"
                uiSchema={uiSchema}
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
        const tooltipBtn = screen.getByRole('button');
        fireEvent.click(tooltipBtn);

        expect(screen.getByText('general.email')).toBeInTheDocument();
        expect(screen.getByText('general.emailTooltip')).toBeInTheDocument();
    });

    it('should trigger handleChange on input change', () => {
        const handleChange = jest.fn();
        render(
            <EmailWidget
                value="abc@mail.com"
                label="Email"
                uiSchema={uiSchema}
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
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        fireEvent.change(emailInput, { target: { value: 'xyz@mail.com' } });

        expect(handleChange).toHaveBeenCalledTimes(1);
    });
});
