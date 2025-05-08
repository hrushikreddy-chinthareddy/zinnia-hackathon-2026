import '@testing-library/jest-dom';
import { fireEvent, render, renderHook, screen } from '@testing-library/react';

import getMassMutualRmdConfig from '@deps/containers/otp/rmd-forms/mm-rmd-form.helpers';
import { FormDataContext, defaultFormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { CaseStatus, SignVerificationReason } from '@deps/models/case/withdrawal/case';

import SignatureVerificationReasons from './signature-verification-reason';

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: DEFAULT_LOCALE,
        },
    }),
}));

jest.mock('@deps/utils/server-logging');

const t = jest.fn();

describe('Signature Verification component', () => {
    describe('MASS MUTUAL Form', () => {
        it('should render checkboxes as required', () => {
            const {
                result: { current },
            } = renderHook(() => getMassMutualRmdConfig(t));

            render(
                <FormDataContext.Provider value={{ ...defaultFormDataContext }}>
                    <SignatureVerificationReasons checkedItems={[]} config={current.signVerificationReasonConfig} />
                </FormDataContext.Provider>
            );

            const singleCheckboxElement = screen.getByTestId(`verification-reason-test-id-${SignVerificationReason.Single}`);
            expect(singleCheckboxElement).toBeInTheDocument();

            const marriedWithoutERISACheckboxElement = screen.getByTestId(
                `verification-reason-test-id-${SignVerificationReason.MarriedWithoutERISA}`
            );
            expect(marriedWithoutERISACheckboxElement).toBeInTheDocument();

            const marriedWithERISACheckboxElement = screen.getByTestId(
                `verification-reason-test-id-${SignVerificationReason.MarriedWithERISA}`
            );
            expect(marriedWithERISACheckboxElement).toBeInTheDocument();
        });

        it('should checked the required checkbox on page load', async () => {
            const {
                result: { current },
            } = renderHook(() => getMassMutualRmdConfig(t));
            render(
                <FormDataContext.Provider value={{ ...defaultFormDataContext }}>
                    <SignatureVerificationReasons
                        checkedItems={[SignVerificationReason.Single, SignVerificationReason.MarriedWithoutERISA]}
                        config={current.signVerificationReasonConfig}
                    />
                </FormDataContext.Provider>
            );

            const singleCheckboxElement = screen.getByTestId(`verification-reason-test-id-${SignVerificationReason.Single}`);
            expect(singleCheckboxElement).toBeInTheDocument();
            expect(singleCheckboxElement).toBeChecked();

            const marriedWithoutERISACheckboxElement = screen.getByTestId(
                `verification-reason-test-id-${SignVerificationReason.MarriedWithoutERISA}`
            );
            expect(marriedWithoutERISACheckboxElement).toBeInTheDocument();
            expect(marriedWithoutERISACheckboxElement).toBeChecked();
        });

        it('should called required context setter', async () => {
            const {
                result: { current },
            } = renderHook(() => getMassMutualRmdConfig(t));
            const setFormSignature = jest.fn();
            render(
                <FormDataContext.Provider value={{ ...defaultFormDataContext, currentFormState: CaseStatus.Pending, setFormSignature }}>
                    <SignatureVerificationReasons checkedItems={[]} config={current.signVerificationReasonConfig} />
                </FormDataContext.Provider>
            );

            const singleCheckboxElement = screen.getByTestId(`verification-reason-test-id-${SignVerificationReason.Single}`);
            expect(singleCheckboxElement).toBeInTheDocument();
            fireEvent.click(singleCheckboxElement);
            expect(setFormSignature).toBeCalled();
        });

        it('should set SignVerificationReason state correctly', async () => {
            const {
                result: { current },
            } = renderHook(() => getMassMutualRmdConfig(t));
            const prevSignatureState = { formSignature: { ...defaultFormDataContext.formSignature } };
            let nextState;
            const mockSetter = jest.fn().mockImplementation(callback => {
                nextState = callback(prevSignatureState);
            });

            render(
                <FormDataContext.Provider
                    value={{ ...defaultFormDataContext, currentFormState: CaseStatus.Pending, setFormSignature: mockSetter }}
                >
                    <SignatureVerificationReasons checkedItems={[]} config={current.signVerificationReasonConfig} />
                </FormDataContext.Provider>
            );

            const singleCheckboxElement: HTMLInputElement = screen.getByTestId(
                `verification-reason-test-id-${SignVerificationReason.Single}`
            );
            expect(singleCheckboxElement).toBeInTheDocument();
            fireEvent.click(singleCheckboxElement);
            expect(singleCheckboxElement.checked).toBeTruthy();

            expect(nextState).toEqual({
                formSignature: { ...defaultFormDataContext.formSignature },
                signVerificationReason: [
                    {
                        text: SignVerificationReason.Single,
                    },
                ],
            });
        });
    });
});
