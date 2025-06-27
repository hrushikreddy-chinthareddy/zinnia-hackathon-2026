import { render, fireEvent } from '@testing-library/react';

import {
    FormDataContext,
    defaultFormDataContext,
} from '@deps/contexts/OtpWithdrawalFormContext';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';

import { RecommendedByAgent } from './agent-reco';

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: DEFAULT_LOCALE,
        },
    }),
}));

afterEach(() => {
    jest.clearAllMocks();
});

describe('RecommendedByAgent Component', () => {
    test('should render CheckboxText component with correct props', () => {
        const { getByText, getByTestId } = render(
            <FormDataContext.Provider value={{ ...defaultFormDataContext }}>
                <RecommendedByAgent />
            </FormDataContext.Provider>
        );

        expect(
            getByText('additionalInformation.isAgentOrBrokerRecommended')
        ).toBeInTheDocument();
        expect(getByTestId('isRecommendedByAgent')).toBeInTheDocument();
    });

    test('should update isAgentOrBrokerRecommended state correctly when CheckboxText is toggled', () => {
        const { getByTestId } = render(
            <FormDataContext.Provider value={{ ...defaultFormDataContext }}>
                <RecommendedByAgent />
            </FormDataContext.Provider>
        );

        const checkbox = getByTestId('isRecommendedByAgent');

        expect(checkbox).not.toBeChecked();
        fireEvent.click(checkbox);
        expect(checkbox).toBeChecked();
    });

    test('should set next state for context correctly', async () => {
        let nextState;
        const prevState = {
            isAgentOrBrokerRecommended: { text: false },
        };
        const mockSetter = jest.fn().mockImplementation((callback) => {
            nextState = callback(prevState);
        });

        const { getByTestId } = render(
            <FormDataContext.Provider
                value={{
                    ...defaultFormDataContext,
                    setFormFullSurrenderAck: mockSetter,
                }}
            >
                <RecommendedByAgent />
            </FormDataContext.Provider>
        );

        const checkbox = getByTestId('isRecommendedByAgent');
        expect(checkbox).not.toBeChecked();
        fireEvent.click(checkbox);

        expect(nextState).toEqual({
            isAgentOrBrokerRecommended: { text: true },
        });
    });
});
