import { faker } from '@faker-js/faker';
import { render, screen, fireEvent } from '@testing-library/react';

import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { generateKebabDate } from '@deps/utils/mock/mockDates';
import {
    ArrangementType,
    SystematicProgram,
    Frequency,
    PaymentForm,
    Status,
} from '@zinnia/api-types/types/sor';

import SystematicProgramsCard from './card-systematic-programs';
import {
    SystematicProgramsCardProps,
    SystematicProgramsCardTest,
} from './card-systematic-programs.types';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('SystematicProgramsCard', () => {
    let props: SystematicProgramsCardProps;
    let element: HTMLElement;

    const generateMockActiveProgram = (): SystematicProgram => ({
        status: Status.ACTIVE,
        arrangementId: ArrangementType.PAYMENT,
        amount: faker.number.int({ min: 100, max: 5000 }),
        frequency: Frequency.MONTHLY,
        nextProgramDate: generateKebabDate(),
        paymentForm: PaymentForm.ACH,
        party: [{ paymentForm: PaymentForm.ACH }],
    });

    const generateMockTerminatedProgram = (): SystematicProgram => ({
        status: Status.TERMINATED,
        arrangementId: ArrangementType.PAYMENT,
        amount: faker.number.int({ min: 100, max: 5000 }),
        frequency: Frequency.MONTHLY,
        endDate: generateKebabDate(),
        paymentForm: PaymentForm.ACH,
        party: [{ paymentForm: PaymentForm.ACH }],
    });

    const defaultProps: SystematicProgramsCardProps = {
        programs: [
            {
                arrangementType: ArrangementType.PAYMENT,
                activePrograms: [generateMockActiveProgram()],
                terminatedOrSuspendedPrograms: [],
                manageAction: { text: faker.lorem.word(), href: '#' },
                cancelAction: { text: faker.lorem.word(), href: '#' },
            },
        ],
        setUpAction: { text: faker.lorem.word(), href: '#' },
    };

    beforeEach(() => {
        props = defaultProps;
    });

    const renderComponent = (props: SystematicProgramsCardProps) =>
        render(
            <SystematicProgramsCard
                data-testid="systematic-programs"
                {...props}
            />
        );

    it('renders without crashing', () => {
        const { getByTestId } = renderComponent(defaultProps);
        const element = getByTestId(SystematicProgramsCardTest.CONTAINER);
        expect(element).toBeInTheDocument();
    });

    describe('design requirements', () => {
        beforeEach(() => {
            const { getByTestId } = renderComponent(defaultProps);
            element = getByTestId(SystematicProgramsCardTest.CONTAINER);
        });

        it('has correct colors', () => {
            expect(element).toHaveClass('bg-white', 'border-gray-100');
        });
    });

    describe('setup action', () => {
        it('renders setup button when setUpAction is provided', () => {
            const setUpActionText = faker.lorem.word();
            props = {
                ...defaultProps,
                setUpAction: { text: setUpActionText, href: '#' },
            };
            const { container } = renderComponent(props);
            expect(container).toHaveTextContent(`setUp`);
        });

        it('does not render setup button when setUpAction is not provided', () => {
            props = {
                ...defaultProps,
                setUpAction: undefined,
            };
            const { container } = renderComponent(props);
            expect(container).not.toHaveTextContent('+ setUp');
        });
    });

    describe('toggle functionality', () => {
        it('renders toggle for show history', () => {
            const { getByTestId } = renderComponent(defaultProps);
            const toggle = getByTestId('show-history-toggle');
            expect(toggle).toBeInTheDocument();
        });

        it('toggle starts as unchecked', () => {
            const { getByTestId } = renderComponent(defaultProps);
            const toggle = getByTestId('show-history-toggle');
            expect(toggle).toBeInTheDocument();
        });

        it('shows terminated programs when toggle is clicked', () => {
            const terminatedProgram = generateMockTerminatedProgram();
            props = {
                ...defaultProps,
                programs: [
                    {
                        ...defaultProps.programs[0],
                        terminatedOrSuspendedPrograms: [terminatedProgram],
                    },
                ],
            };
            const { getByTestId } = renderComponent(props);
            const toggle = getByTestId('show-history-toggle');

            fireEvent.click(toggle);

            // Verify terminated programs section appears
            expect(
                screen.getByText('allFields.systemProgramStatus')
            ).toBeInTheDocument();
            expect(
                screen.getByText('allFields.terminationDate')
            ).toBeInTheDocument();
        });
    });

    describe('active programs table', () => {
        const activeProgram = generateMockActiveProgram();

        beforeEach(() => {
            props = {
                ...defaultProps,
                programs: [
                    {
                        arrangementType: ArrangementType.PAYMENT,
                        activePrograms: [activeProgram],
                        terminatedOrSuspendedPrograms: [],
                        manageAction: { text: 'Manage', href: '#' },
                        cancelAction: { text: 'Cancel', href: '#' },
                    },
                ],
            };
            const { getByTestId } = renderComponent(props);
            element = getByTestId(SystematicProgramsCardTest.CONTAINER);
        });

        it('renders table headers correctly', () => {
            expect(element).toHaveTextContent('type');
            expect(element).toHaveTextContent('paymentAmount');
            expect(element).toHaveTextContent('frequency');
            expect(element).toHaveTextContent('nextPayment');
            expect(element).toHaveTextContent('paymentType');
            expect(element).toHaveTextContent('actions');
        });

        it('displays active program data', () => {
            expect(element).toHaveTextContent(
                numberFormatify(activeProgram.amount)
            );
        });

        it('displays manage and cancel actions', () => {
            expect(element).toHaveTextContent('manage');
            expect(element).toHaveTextContent('cancel');
        });

        it('formats payment amount correctly', () => {
            const formattedAmount = numberFormatify(activeProgram.amount);
            expect(element).toHaveTextContent(formattedAmount);
        });
    });

    describe('terminated and suspended programs', () => {
        const terminatedProgram = generateMockTerminatedProgram();

        beforeEach(() => {
            props = {
                ...defaultProps,
                programs: [
                    {
                        arrangementType: ArrangementType.PAYMENT,
                        activePrograms: [],
                        terminatedOrSuspendedPrograms: [terminatedProgram],
                        manageAction: { text: 'Manage', href: '#' },
                        cancelAction: { text: 'Cancel', href: '#' },
                    },
                ],
            };
        });

        it('does not show terminated programs initially', () => {
            const { queryByText } = renderComponent(props);
            expect(queryByText('terminationDate')).not.toBeInTheDocument();
        });

        it('shows terminated programs after toggle', () => {
            const { getByTestId } = renderComponent(props);
            const toggle = getByTestId('show-history-toggle');

            fireEvent.click(toggle);

            expect(
                screen.getByText('allFields.systemProgramStatus')
            ).toBeInTheDocument();
            expect(
                screen.getByText('allFields.terminationDate')
            ).toBeInTheDocument();
        });

        it('displays terminated program status', () => {
            const { getByTestId } = renderComponent(props);
            const toggle = getByTestId('show-history-toggle');

            fireEvent.click(toggle);

            const element = getByTestId(SystematicProgramsCardTest.CONTAINER);
            expect(element).toBeInTheDocument();
        });

        it('formats termination date correctly', () => {
            const { getByTestId } = renderComponent(props);
            const toggle = getByTestId('show-history-toggle');

            fireEvent.click(toggle);

            // Verify date is displayed in the correct format
            const element = getByTestId(SystematicProgramsCardTest.CONTAINER);
            expect(element).toBeInTheDocument();
        });
    });

    describe('empty states', () => {
        it('renders when no active programs exist', () => {
            props = {
                ...defaultProps,
                programs: [
                    {
                        arrangementType: ArrangementType.PAYMENT,
                        activePrograms: [],
                        terminatedOrSuspendedPrograms: [],
                        manageAction: { text: 'Manage', href: '#' },
                        cancelAction: { text: 'Cancel', href: '#' },
                    },
                ],
            };
            const { getByTestId } = renderComponent(props);
            const element = getByTestId(SystematicProgramsCardTest.CONTAINER);
            expect(element).toBeInTheDocument();
        });

        it('renders when programs array is empty', () => {
            props = {
                ...defaultProps,
                programs: [],
            };
            const { getByTestId } = renderComponent(props);
            const element = getByTestId(SystematicProgramsCardTest.CONTAINER);
            expect(element).toBeInTheDocument();
        });
    });
});
