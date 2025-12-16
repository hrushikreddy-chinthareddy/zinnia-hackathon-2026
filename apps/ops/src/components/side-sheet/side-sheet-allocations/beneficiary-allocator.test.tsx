import { faker } from '@faker-js/faker';
import {
    Matcher,
    SelectorMatcherOptions,
    fireEvent,
    render,
} from '@testing-library/react';

import { PartyRole } from '@zinnia/api-types/types/sor';

import BeneficiaryAllocator, {
    BeneficiaryAllocatorProps,
} from './beneficiary-allocator';
import { Beneficiary } from './side-sheet-allocations-helpers';
const MAX_ALLOCATION = 100;

describe('beneficiary-allocator', () => {
    let props: BeneficiaryAllocatorProps;
    const mockOnChange = jest.fn();
    // numbers divisible by 100, since input only takes whole numbers
    const numberOfBeneficiaries = faker.helpers.arrayElement([2, 4, 5, 10, 20]);
    const mockBeneficiaries: Beneficiary[] = Array.from({
        length: numberOfBeneficiaries,
    }).map(() => ({
        partyId: faker.string.uuid(),
        beneficiaryPercentage: faker.number.int({ min: 1, max: 100 }),
        firstLastName: `${faker.person.firstName()} ${faker.person.lastName()}`,
    }));
    const renderComponent = () => render(<BeneficiaryAllocator {...props} />);
    const getRandomParty = () => faker.helpers.arrayElement(mockBeneficiaries);
    let randomParty: Beneficiary;
    const changeInputTo = (input: HTMLElement, value: string) => {
        fireEvent.change(input, { target: { value } });
        fireEvent.blur(input);
    };
    const changeAllInputsTo = (allInputs: HTMLElement[], value: string) =>
        allInputs.forEach((input) => changeInputTo(input, value));

    beforeEach(() => {
        props = {
            beneficiaries: mockBeneficiaries,
            partyRole: faker.helpers.arrayElement([
                PartyRole.PRIMARYBENEFICIARY,
                PartyRole.CONTINGENTBENEFICIARY,
            ]),
            onChange: mockOnChange,
            needsValidation: false,
        };
        randomParty = getRandomParty();
    });

    it('renders the beneficiary first and last name', () => {
        const { getByText } = renderComponent();
        const randomParty = faker.helpers.arrayElement(mockBeneficiaries);
        expect(
            getByText(randomParty.firstLastName as string)
        ).toBeInTheDocument();
    });

    describe('focus and labeling', () => {
        it('puts focused party at the top of list, by ID', () => {
            props.focusedPartyId = randomParty.partyId;
            const { container } = renderComponent();
            const [firstElement] = Array.from(
                container.querySelectorAll('[id^=allocationField-]')
            );
            expect(firstElement).toHaveAttribute(
                'id',
                `allocationField-${randomParty.partyId}`
            );
        });

        it('labels party role correctly', () => {
            const { getByText } = renderComponent();
            mockBeneficiaries.map(({ firstLastName, partyId }) => {
                const element = getByText(
                    firstLastName as string
                ).parentElement;
                expect(element).toHaveAttribute(
                    'id',
                    `allocationField-${partyId}`
                );
            });
        });
    });

    describe('events', () => {
        it('passes onChange correctly', () => {
            props.focusedPartyId = randomParty.partyId;
            const { getByLabelText } = renderComponent();
            const input = getByLabelText('sideSheet.allocation.allocation');
            fireEvent.change(input, { target: { value: '75' } });
            expect(mockOnChange).toHaveBeenCalled();
        });
    });

    describe('validation', () => {
        beforeEach(() => {
            props.needsValidation = true;
            props.focusedPartyId = randomParty.partyId;
        });

        describe('skip validation', () => {
            it('does not validate when needsValidation is false', () => {
                props.needsValidation = false;
                const { getByLabelText, queryByText } = renderComponent();
                const input = getByLabelText('sideSheet.allocation.allocation');
                changeInputTo(input, `${faker.number.int(100)}`);
                const errorText = queryByText(
                    'sideSheet.allocation.allocationsTotalMustEqual100Pct'
                );
                expect(errorText).not.toBeInTheDocument();
            });
        });

        describe('validators', () => {
            let firstInput: HTMLElement;
            let restInput: HTMLElement[];
            let allInputs: HTMLElement[];
            let localQueryByText: (
                id: Matcher,
                options?: SelectorMatcherOptions | undefined
            ) => HTMLElement | null;

            beforeEach(() => {
                const { getAllByLabelText, getByLabelText, queryByText } =
                    renderComponent();
                firstInput = getByLabelText('sideSheet.allocation.allocation');
                restInput = getAllByLabelText('ariaLabel.genericInput');
                allInputs = [firstInput, ...restInput];
                localQueryByText = queryByText;
                expect(allInputs).toHaveLength(numberOfBeneficiaries);
            });

            it('does not let any beneficiaryPercentage be 0', () => {
                changeInputTo(firstInput, '0');
                const errorText = localQueryByText(
                    'sideSheet.allocation.allocationsMustNotEqual0'
                );
                expect(errorText).toBeInTheDocument();
            });

            it('does not show error text when total allocations are 100%', () => {
                // all inputs should add up to 100
                const value = MAX_ALLOCATION / numberOfBeneficiaries;
                changeAllInputsTo(allInputs, `${value}`);
                expect(value * numberOfBeneficiaries).toBe(100);
                const errorText = localQueryByText(
                    'sideSheet.allocation.allocationsTotalMustEqual100Pct'
                );
                expect(errorText).not.toBeInTheDocument();
            });

            it('shows error text when total allocations above 100%', () => {
                // maximum value
                const value = MAX_ALLOCATION - 1;
                expect(value * numberOfBeneficiaries).toBeGreaterThan(
                    MAX_ALLOCATION
                );
                changeAllInputsTo(allInputs, `${value}`);
                const errorText = localQueryByText(
                    'sideSheet.allocation.allocationsTotalMustEqual100Pct'
                );
                expect(errorText).toBeInTheDocument();
            });

            it('shows error text when total allocations below 100%', () => {
                // minimum value
                const value = 1;
                expect(value * numberOfBeneficiaries).toBeLessThan(
                    MAX_ALLOCATION
                );
                changeAllInputsTo(allInputs, `${value}`);
                const errorText = localQueryByText(
                    'sideSheet.allocation.allocationsTotalMustEqual100Pct'
                );
                expect(value).toBe(1);
                expect(errorText).toBeInTheDocument();
            });
        });
    });
});
