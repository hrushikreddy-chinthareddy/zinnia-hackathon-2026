import { faker } from '@faker-js/faker';
import { render } from '@testing-library/react';

import { numberFormatify } from '@deps/helpers/numbers.helpers';
import {
    convertKebabedDateString,
    toTitleCase,
} from '@deps/helpers/string.helpers';
import { generateBankDetails } from '@deps/utils/mock/mockBankDetails';
import { generateKebabDate } from '@deps/utils/mock/mockDates';
import { generateAdditionalCharges } from '@deps/utils/mock/mockPolicyValues';

import UpcomingPaymentCard from './card-upcoming-payment';
import {
    UpcomingPaymentCardTest,
    UpcomingPaymentCardProps,
} from './card-upcoming-payment.types';
import { CardTransactionsTest } from '../card-transactions/card-transactions';

jest.mock('@deps/queries/api/cases', () => {
    return {
        getCases: jest.fn(() => {
            return Promise.resolve({});
        }),
    };
});

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('UpcomingPaymentCard', () => {
    let props: UpcomingPaymentCardProps;
    let element: HTMLElement;
    const pageTitle = faker.lorem.words();
    const defaultProps = {
        title: pageTitle,
        paymentFrequencyText: 'iejfij',
        inactiveHeaderText: '9ij',
        footerLinks: [
            { text: faker.lorem.word(), href: '#' },
            { text: faker.lorem.word(), href: '#' },
        ],
    };

    beforeEach(() => {
        props = defaultProps;
    });

    const renderComponent = (props: UpcomingPaymentCardProps) =>
        render(<UpcomingPaymentCard data-testid="jfjfj" {...props} />);

    it('renders without crashing', () => {
        const { getByTestId } = renderComponent(defaultProps);
        const element = getByTestId(UpcomingPaymentCardTest.CONTAINER);
        expect(element).toHaveTextContent(toTitleCase(pageTitle));
    });

    describe('design requirements', () => {
        beforeEach(() => {
            const { getByTestId } = renderComponent(defaultProps);
            element = getByTestId(UpcomingPaymentCardTest.CONTAINER);
        });

        it('has correct colors', () => {
            // ask design to update with tokens
            // bg color #FFFFFF
            // Border Color #EDEDED
            expect(element).toHaveClass('bg-white', 'border-gray-100');
        });
    });

    describe('custom title and icon', () => {
        it('renders custom title and icon', () => {
            const title = faker.lorem.word();

            props = {
                ...defaultProps,
                title,
            };
            const { getByTestId } = renderComponent(props);
            const element = getByTestId(UpcomingPaymentCardTest.CONTAINER);
            expect(element).toBeInTheDocument();
            expect(element).toHaveTextContent(toTitleCase(title));
        });
    });

    describe('active state', () => {
        const paymentDate = generateKebabDate();
        const paymentText = faker.lorem.word();
        const paymentDateText = faker.lorem.word();
        const bankDetails = generateBankDetails('partyId', 'fullName');
        const autopayAmount = faker.number.int({
            min: 1,
            max: 1000,
        });

        const activeProps = {
            ...defaultProps,
            autopayAmount,
            paymentDate,
            paymentText,
            paymentDateText,
            bankDetails,
            displayCardWithZeroAmount: false,
            hasProgram: true,
        };

        it('renders correct content', () => {
            const { getByTestId } = renderComponent(activeProps);
            const element = getByTestId(UpcomingPaymentCardTest.ACTIVE);
            expect(element).toBeInTheDocument();
            [
                convertKebabedDateString(paymentDate),
                toTitleCase(paymentDateText),
            ].map((prop) => expect(element).toHaveTextContent(prop));
        });

        it('title cases correct props', () => {
            const { getByTestId } = renderComponent(activeProps);
            const element = getByTestId(UpcomingPaymentCardTest.ACTIVE);
            expect(element).toBeInTheDocument();
            [toTitleCase(paymentText)].map((prop) =>
                expect(element).toHaveTextContent(prop)
            );
        });

        it('only shows last 4 digits in account', () => {
            const { getByTestId } = renderComponent(activeProps);
            const element = getByTestId(UpcomingPaymentCardTest.ACTIVE);
            expect(element).toBeInTheDocument();
            expect(element).toHaveTextContent(
                bankDetails.accountNumber?.slice(-4) as string
            );
        });

        it('displays "Pending calculation" when amount is zero and displayCardWithZeroAmount is true', () => {
            props = {
                ...defaultProps,
                autopayAmount: 0,
                additionalCharges: [],
                displayCardWithZeroAmount: true,
                paymentDate,
                paymentText,
                paymentDateText,
                bankDetails,
                hasProgram: true,
            };
            const { getByTestId } = renderComponent(props);
            const activeElement = getByTestId(UpcomingPaymentCardTest.ACTIVE);
            expect(activeElement).toBeInTheDocument();
            expect(activeElement).toHaveTextContent('pendingCalculation');
            expect(activeElement).not.toHaveTextContent(numberFormatify(0));
        });
    });

    describe('inactive state', () => {
        const inactiveText = 'Body Text';
        const inactiveHeaderText = 'Header';
        const inactiveIcon = 'Icon';

        const inactiveProps = {
            ...defaultProps,
            paymentDate: undefined,
            inactiveIcon,
            inactiveText,
            inactiveHeaderText,
            displayCardWithZeroAmount: false,
            hasProgram: false,
        };

        it('renders correct content', () => {
            const { getByTestId } = renderComponent(inactiveProps);
            element = getByTestId(UpcomingPaymentCardTest.INACTIVE);
            expect(element).toBeInTheDocument();
            [
                // title cased
                toTitleCase(inactiveHeaderText),
                inactiveText,
                inactiveIcon,
            ].map((text) => expect(element).toHaveTextContent(text));
            expect(element).toHaveTextContent(inactiveText);
            expect(element).toHaveTextContent(toTitleCase(inactiveHeaderText));
            expect(element).toHaveTextContent(inactiveIcon);
        });

        it('renders inactive state when hasProgram is false, even if displayCardWithZeroAmount is true', () => {
            const props = {
                ...defaultProps,
                autopayAmount: 0,
                additionalCharges: [],
                displayCardWithZeroAmount: true,
                hasProgram: false,
                paymentDate: undefined,
                inactiveText,
                inactiveHeaderText,
            };
            const { getByTestId } = renderComponent(props);
            element = getByTestId(UpcomingPaymentCardTest.INACTIVE);
            expect(element).toBeInTheDocument();
            expect(element).toHaveTextContent(inactiveText);
            expect(element).toHaveTextContent(inactiveHeaderText);
        });
    });

    describe('card-transactions props', () => {
        const autopayAmount = faker.number.int({
            min: 100,
            max: 1000,
        });
        const numberOfCharges = faker.number.int({
            min: 3,
            max: 10,
        });

        const paymentDate = String(faker.date.anytime());
        const paymentFrequencyText = faker.lorem.word();
        const additionalChargesTitle = faker.lorem.word();
        const additionalCharges = generateAdditionalCharges(numberOfCharges);
        beforeEach(() => {
            props = {
                ...defaultProps,
                autopayAmount,
                paymentDate,
                paymentFrequencyText,
                additionalChargesTitle,
                additionalCharges,
                hasProgram: true,
            };
            const { getByTestId } = renderComponent(props);
            element = getByTestId(CardTransactionsTest.Container);
        });

        it('shows custom titles', () => {
            expect(element).toBeInTheDocument();
            [
                toTitleCase(paymentFrequencyText),
                toTitleCase(additionalChargesTitle),
            ].map((text) => expect(element).toHaveTextContent(text));
        });

        it('adds up additional charges to equal premium', () => {
            const additionalChargesTotal = additionalCharges.reduce(
                (acc, { amount = 0 }) => (acc += amount),
                0
            );
            const total = autopayAmount + additionalChargesTotal;
            expect(element).toHaveTextContent(numberFormatify(total));
        });
    });

    describe('footer links', () => {
        const numberOfLinks = faker.number.int({ min: 1, max: 10 });
        const footerLinksLabels = faker.helpers
            .uniqueArray(faker.lorem.word, numberOfLinks)
            .map((word) => ({ text: word, href: '#' }));
        beforeEach(() => {
            props = {
                ...defaultProps,
                footerLinks: footerLinksLabels,
            };
            const { getByTestId } = renderComponent(props);
            element = getByTestId(UpcomingPaymentCardTest.CONTAINER);
        });
        it('shows correct number of footer links', () => {
            expect(element).toBeInTheDocument();
            footerLinksLabels.map((link) =>
                expect(element).toHaveTextContent(link.text)
            );
        });
    });
});
