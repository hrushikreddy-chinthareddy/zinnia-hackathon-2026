import { render, fireEvent, screen } from '@testing-library/react';

import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { PolicyWaiver } from '@deps/models/case/withdrawal/case';

import { FormWaiverItem } from './form-waiver-item';

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: DEFAULT_LOCALE,
        },
    }),
}));

describe('FormWaiverItem Component', () => {
    test('should set isVisible state correctly', () => {
        render(
            <FormWaiverItem
                id={PolicyWaiver.NURSING_HOME_AND_HOSPITAL}
                title="Title"
                optionTitle="Option"
                options={[]}
                selectedOption={undefined}
                onChange={() => {}}
            />
        );
        const checkbox: HTMLInputElement = screen.getByTestId(
            'NURSING_HOME_AND_HOSPITAL-checkbox'
        );
        expect(checkbox.checked).toBe(false);
        fireEvent.click(checkbox);
        expect(checkbox.checked).toBe(true);
    });

    test('should call onChange with correct parameters on mount', () => {
        const onChangeMock = jest.fn();
        render(
            <FormWaiverItem
                id={PolicyWaiver.NURSING_HOME_AND_HOSPITAL}
                title="Title"
                optionTitle="Option"
                options={[
                    { label: 'yes', value: 'yes' },
                    { label: 'no', value: 'no' },
                ]}
                selectedOption={undefined}
                onChange={onChangeMock}
            />
        );
        expect(onChangeMock).toHaveBeenCalledWith({
            text: PolicyWaiver.NURSING_HOME_AND_HOSPITAL,
            action: 'REMOVE',
            selectionOptions: {
                isValid: {
                    text: null,
                },
            },
        });
    });

    test('should call onChange callback correctly when visible and Yes option selected', () => {
        const onChangeMock = jest.fn();
        render(
            <FormWaiverItem
                id={PolicyWaiver.NURSING_HOME_AND_HOSPITAL}
                title="Title"
                optionTitle="Option"
                options={[
                    { label: 'yes', value: 'true' },
                    { label: 'no', value: 'false' },
                ]}
                selectedOption={{ isValid: { text: false } }}
                onChange={onChangeMock}
            />
        );

        const Option: HTMLInputElement = screen.getByTestId(
            'button-group-label-test-id-yes'
        );
        fireEvent.click(Option);
        expect(onChangeMock).toHaveBeenCalledWith({
            text: PolicyWaiver.NURSING_HOME_AND_HOSPITAL,
            action: 'ADD',
            selectionOptions: {
                isValid: {
                    text: true,
                },
            },
        });
    });

    test('should call on change callback correctly when visible and No option selected', () => {
        const onChangeMock = jest.fn();
        render(
            <FormWaiverItem
                id={PolicyWaiver.NURSING_HOME_AND_HOSPITAL}
                title="Title"
                optionTitle="Option"
                options={[
                    { label: 'yes', value: 'true' },
                    { label: 'no', value: 'false' },
                ]}
                selectedOption={{ isValid: { text: true } }}
                onChange={onChangeMock}
            />
        );

        const Option: HTMLInputElement = screen.getByTestId(
            'button-group-label-test-id-no'
        );
        fireEvent.click(Option);
        expect(onChangeMock).toHaveBeenCalledWith({
            text: PolicyWaiver.NURSING_HOME_AND_HOSPITAL,
            action: 'ADD',
            selectionOptions: {
                isValid: {
                    text: false,
                },
            },
        });
    });

    test('should call onChange with correct parameters when checkbox is unchecked (invisible options)', () => {
        const onChangeMock = jest.fn();
        render(
            <FormWaiverItem
                id={PolicyWaiver.NURSING_HOME_AND_HOSPITAL}
                title="Title"
                optionTitle="Option"
                options={[
                    { label: 'yes', value: 'true' },
                    { label: 'no', value: 'false' },
                ]}
                selectedOption={{ isValid: { text: true } }}
                onChange={onChangeMock}
            />
        );

        const checkbox: HTMLInputElement = screen.getByTestId(
            'NURSING_HOME_AND_HOSPITAL-checkbox'
        );
        fireEvent.click(checkbox);
        expect(checkbox.checked).toBe(false);

        expect(onChangeMock).toHaveBeenCalledWith({
            text: PolicyWaiver.NURSING_HOME_AND_HOSPITAL,
            action: 'REMOVE',
            selectionOptions: {
                isValid: {
                    text: true,
                },
            },
        });
    });
});
