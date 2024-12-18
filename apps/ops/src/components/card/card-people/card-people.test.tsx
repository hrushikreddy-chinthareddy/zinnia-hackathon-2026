import { render, screen } from '@testing-library/react';

import CardPeople, { CardPeopleProps } from './card-people';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: () => {} }),
}));

describe('CardPeople', () => {
    const individualName = 'John Doe';
    const trustName = 'Example Trust';
    const orgName = 'ORGCODE';
    const tags = [{ text: 'chipFilter.partyRole.assignee' }, { text: 'chipFilter.partyRole.riderInsured' }];
    const allocation = '50';
    const accessibilityText = 'Accessibility text';
    const accessibilityClickText = 'Accessibility text';
    const index = 1;
    const shouldFocus = false;

    test('renders correct names and tags', () => {
        const individualProps: CardPeopleProps = {
            name: individualName,
            tags,
            allocation,
            accessibilityText,
            accessibilityClickText,
            index,
            shouldFocus,
        };

        render(<CardPeople {...individualProps} />);
        expect(screen.getByText(individualName)).toBeInTheDocument();
        expect(screen.getByText(tags[0].text)).toBeInTheDocument();
        expect(screen.getByText(tags[1].text)).toBeInTheDocument();

        const trustProps: CardPeopleProps = {
            name: trustName,
            tags,
            allocation,
            accessibilityText,
            accessibilityClickText,
            index,
            shouldFocus,
        };

        render(<CardPeople {...trustProps} />);
        expect(screen.getByText(trustName)).toBeInTheDocument();

        const orgProps: CardPeopleProps = {
            name: orgName,
            tags,
            allocation,
            accessibilityText,
            accessibilityClickText,
            index,
            shouldFocus,
        };

        render(<CardPeople {...orgProps} />);
        expect(screen.getByText(orgName)).toBeInTheDocument();
    });

    test('renders allocation if provided', () => {
        const name = individualName;
        const props: CardPeopleProps = { name, tags, allocation, accessibilityText, accessibilityClickText, index, shouldFocus };

        render(<CardPeople {...props} />);
        const allocationElement = screen.getByTestId('allocation');
        expect(allocationElement).toBeInTheDocument();
    });

    test('does not render allocation if not provided', () => {
        const name = individualName;
        const propsWithoutAllocation: CardPeopleProps = { name, tags, accessibilityText, accessibilityClickText, index, shouldFocus };

        render(<CardPeople {...propsWithoutAllocation} />);
        expect(screen.queryByTestId('allocation')).toBeNull();
    });
});
