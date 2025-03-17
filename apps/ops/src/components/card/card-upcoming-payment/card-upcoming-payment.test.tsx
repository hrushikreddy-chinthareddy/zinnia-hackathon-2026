import { faker } from '@faker-js/faker';
import { render } from '@testing-library/react';

import { numberFormatify } from '@deps/helpers/numbers.helper';
import { convertKebabedDateString, toTitleCase } from '@deps/helpers/string.helper';
import { generateBankDetails } from '@deps/utils/mock/mockBankDetails';
import { generateKebabDate } from '@deps/utils/mock/mockDates';
import { generateAdditionalCharges } from '@deps/utils/mock/mockPolicyValues';

import UpcomingPaymentCard from './card-upcoming-payment';
import { UpcomingPaymentCardTest, UpcomingPaymentCardProps } from './card-upcoming-payment.types';
import { CardTransactionsTest } from '../card-transactions/card-transactions';

jest.mock('@deps/queries/api/cases', () => {
    return {
        getCases: jest.fn(() => {
            return Promise.resolve({});
        }),
    };
});

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

    const renderComponent = () => render(<UpcomingPaymentCard data-testid="jfjfj" {...props} />);

    it('renders without crashing', () => {
        const { getByTestId } = renderComponent();
        const element = getByTestId(UpcomingPaymentCardTest.CONTAINER);
        expect(element).toHaveTextContent(toTitleCase(pageTitle));
    });

    describe('design requirements', () => {
        beforeEach(() => {
            const { getByTestId } = renderComponent();
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
            const icon = faker.lorem.word();
            props = {
                ...defaultProps,
                title,
                icon,
            };
            const { getByTestId } = renderComponent();
            const element = getByTestId(UpcomingPaymentCardTest.CONTAINER);
            expect(element).toBeInTheDocument();
            [toTitleCase(title), icon].map(text => expect(element).toHaveTextContent(text));
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

        beforeEach(() => {
            props = {
                ...defaultProps,
                autopayAmount,
                paymentDate,
                paymentText,
                paymentDateText,
                bankDetails,
            };
            const { getByTestId } = renderComponent();
            element = getByTestId(UpcomingPaymentCardTest.ACTIVE);
        });

        it('renders correct content', () => {
            expect(element).toBeInTheDocument();
            [convertKebabedDateString(paymentDate), toTitleCase(paymentDateText)].map(prop => expect(element).toHaveTextContent(prop));
        });

        it('title cases correct props', () => {
            expect(element).toBeInTheDocument();
            [toTitleCase(paymentText)].map(prop => expect(element).toHaveTextContent(prop));
        });

        it('only shows last 4 digits in account', () => {
            expect(element).toBeInTheDocument();
            expect(element).toHaveTextContent(bankDetails.accountNumber?.slice(-4) as string);
        });
    });

    describe('inactive state', () => {
        const inactiveText = 'Body Text';
        const inactiveHeaderText = 'Header';
        const inactiveIcon = 'Icon';
        beforeEach(() => {
            props = {
                ...defaultProps,
                paymentDate: undefined,
                inactiveIcon,
                inactiveText,
                inactiveHeaderText,
            };
            const { getByTestId } = renderComponent();
            element = getByTestId(UpcomingPaymentCardTest.INACTIVE);
        });

        it('renders correct content', () => {
            expect(element).toBeInTheDocument();
            [
                // title cased
                toTitleCase(inactiveHeaderText),
                inactiveText,
                inactiveIcon,
            ].map(text => expect(element).toHaveTextContent(text));
            expect(element).toHaveTextContent(inactiveText);
            expect(element).toHaveTextContent(toTitleCase(inactiveHeaderText));
            expect(element).toHaveTextContent(inactiveIcon);
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
            };
            const { getByTestId } = renderComponent();
            element = getByTestId(CardTransactionsTest.Container);
        });

        it('shows custom titles', () => {
            expect(element).toBeInTheDocument();
            [toTitleCase(paymentFrequencyText), toTitleCase(additionalChargesTitle)].map(text => expect(element).toHaveTextContent(text));
        });

        it('adds up additional charges to equal premium', () => {
            const additionalChargesTotal = additionalCharges.reduce((acc, { amount = 0 }) => (acc += amount), 0);
            const total = autopayAmount + additionalChargesTotal;
            expect(element).toHaveTextContent(numberFormatify(total));
        });
    });

    describe('footer links', () => {
        const numberOfLinks = faker.number.int({ min: 1, max: 10 });
        const footerLinksLabels = faker.helpers.uniqueArray(faker.lorem.word, numberOfLinks).map(word => ({ text: word, href: '#' }));
        beforeEach(() => {
            props = {
                ...defaultProps,
                footerLinks: footerLinksLabels,
            };
            const { getByTestId } = renderComponent();
            element = getByTestId(UpcomingPaymentCardTest.CONTAINER);
        });
        it('shows correct number of footer links', () => {
            expect(element).toBeInTheDocument();
            footerLinksLabels.map(link => expect(element).toHaveTextContent(link.text));
        });
    });
});
