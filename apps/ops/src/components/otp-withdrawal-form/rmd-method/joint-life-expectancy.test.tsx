import '@testing-library/jest-dom';
import { fireEvent, render, renderHook, screen } from '@testing-library/react';

import getFlicRmdConfig from '@deps/containers/otp/rmd-forms/flic-rmd-form.helper';
import getMassMutualRmdConfig from '@deps/containers/otp/rmd-forms/mm-rmd-form.helper';
import { FormDataContext, defaultFormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { CaseStatus } from '@deps/models/case/withdrawal/case';

import JointLifeExpectancy from './joint-life-expectancy';

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

describe('JointLifeExpectancy component', () => {
    describe('FLIC Form', () => {
        it('should render checkbox', () => {
            const { jointLifeExpectancyConfigs } = getFlicRmdConfig(t);

            render(
                <FormDataContext.Provider value={{ ...defaultFormDataContext }}>
                    <JointLifeExpectancy configs={jointLifeExpectancyConfigs} />
                </FormDataContext.Provider>
            );

            const checkboxElement = screen.getByTestId('is-joint-life-expectancy-test-id');
            expect(checkboxElement).toBeInTheDocument();
            expect(checkboxElement).not.toBeChecked();
        });

        it('should render joint life expectancy field when check', async () => {
            const { jointLifeExpectancyConfigs } = getFlicRmdConfig(t);

            render(
                <FormDataContext.Provider value={{ ...defaultFormDataContext, currentFormState: CaseStatus.Pending }}>
                    <JointLifeExpectancy configs={jointLifeExpectancyConfigs} />
                </FormDataContext.Provider>
            );

            const checkboxElement = screen.getByTestId('is-joint-life-expectancy-test-id');
            expect(checkboxElement).toBeInTheDocument();

            fireEvent.click(checkboxElement);

            const firstNameInput = screen.getByTestId('first-name-test-id');
            const middleNameInput = screen.getByTestId('middle-name-test-id');
            const LastNameInput = screen.getByTestId('last-name-test-id');
            const dobInput = screen.getByTestId('dob-test-id');

            expect(firstNameInput).toBeInTheDocument();
            expect(middleNameInput).toBeInTheDocument();
            expect(LastNameInput).toBeInTheDocument();
            expect(dobInput).toBeInTheDocument();
        });
    });

    describe('MASS MUTUAL Form', () => {
        it('should render checkbox', () => {
            const {
                result: { current },
            } = renderHook(() => getMassMutualRmdConfig(t));

            render(
                <FormDataContext.Provider value={{ ...defaultFormDataContext }}>
                    <JointLifeExpectancy configs={current.jointLifeExpectancyConfigs} />
                </FormDataContext.Provider>
            );

            const checkboxElement = screen.getByTestId('is-joint-life-expectancy-test-id');
            expect(checkboxElement).toBeInTheDocument();

            expect(checkboxElement).not.toBeChecked();
        });

        it('should render joint life expectancy field when check', async () => {
            const {
                result: { current },
            } = renderHook(() => getMassMutualRmdConfig(t));
            render(
                <FormDataContext.Provider value={{ ...defaultFormDataContext, currentFormState: CaseStatus.Pending }}>
                    <JointLifeExpectancy configs={current.jointLifeExpectancyConfigs} />
                </FormDataContext.Provider>
            );

            const checkboxElement = screen.getByTestId('is-joint-life-expectancy-test-id');
            expect(checkboxElement).toBeInTheDocument();

            fireEvent.click(checkboxElement);

            const firstNameInput = screen.getByTestId('first-name-test-id');
            const middleNameInput = screen.getByTestId('middle-name-test-id');
            const LastNameInput = screen.getByTestId('last-name-test-id');
            const dobInput = screen.getByTestId('dob-test-id');
            const taxIdInput = screen.getByTestId('tax-id-test-id');

            expect(firstNameInput).toBeInTheDocument();
            expect(middleNameInput).toBeInTheDocument();
            expect(LastNameInput).toBeInTheDocument();
            expect(dobInput).toBeInTheDocument();
            expect(taxIdInput).toBeInTheDocument();
        });
    });
});
