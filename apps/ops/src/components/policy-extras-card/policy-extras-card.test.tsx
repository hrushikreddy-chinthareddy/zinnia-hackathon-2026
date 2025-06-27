jest.mock('@auth0/nextjs-auth0');
import { fireEvent, render, screen } from '@testing-library/react';

import {
    BadgeTest,
    PolicyExtrasTest,
    PopoverTest,
} from '@deps/jest/constants/test-id-constants';
import { generateFields } from '@deps/utils/mock/mockPolicyExtrasFields';

import PolicyExtrasCard, { PolicyExtrasCardProps } from './policy-extras-card';
import Badge from '../badge/badge';
import { BadgeVariant } from '../badge/badge.helpers';

describe('PolicyExtrasCard', () => {
    const headerText = 'header text';
    const labelText = 'label text';
    const badgeLabelText = 'Badge Label';
    const subheader = ['subheader 1'];
    const badge = (
        <Badge variant={BadgeVariant.Success} label={badgeLabelText} />
    );
    const numberOfFields = 1;
    const children = generateFields(numberOfFields);

    let props: JSX.IntrinsicAttributes & PolicyExtrasCardProps;

    beforeEach(() => {
        props = {
            headerText: headerText,
            subheader: subheader,
            labelText: labelText,
            badge,
            children,
        };
    });

    const renderComponent = () => render(<PolicyExtrasCard {...props} />);

    describe('Layout', () => {
        describe('header', () => {
            it('renders correctly', () => {
                renderComponent();
                const containerElement = screen.getByTestId(
                    PolicyExtrasTest.CONTAINER
                );
                const headerElement = screen.getByText(headerText, {
                    exact: false,
                });
                const labelElement = screen.getByText(labelText, {
                    exact: false,
                });
                const subheaderElement = screen.getByTestId(
                    PolicyExtrasTest.SUBHEADER
                );
                const BadgeElement = screen.getByTestId(BadgeTest.Badge);
                const requiredElements = [
                    containerElement,
                    headerElement,
                    labelElement,
                    subheaderElement,
                    BadgeElement,
                ];
                requiredElements.forEach((element) =>
                    expect(element).toBeInTheDocument()
                );
            });
        });

        describe('tooltip', () => {
            it('does not render Popover when props not passed', () => {
                renderComponent();
                const popover = screen.queryByTestId(PopoverTest.Popover);
                expect(popover).not.toBeInTheDocument();
            });

            it('renders Popover when props passed', async () => {
                props.tooltipBody = 'test';
                props.tooltipTitle = 'test title';
                renderComponent();
                const popoverElement = screen.getByTestId(PopoverTest.Popover);
                fireEvent.click(popoverElement);
                const popoverTitle = await screen.findByTestId(
                    PopoverTest.Popover
                );
                const popoverBody = await screen.findByTestId(PopoverTest.Body);
                const requiredElements = [
                    popoverElement,
                    popoverBody,
                    popoverTitle,
                ];
                requiredElements.forEach((element) =>
                    expect(element).toBeInTheDocument()
                );
            });
        });

        describe('children', () => {
            it('renders children', () => {
                renderComponent();
                const fieldElements = screen.getAllByTestId(
                    PolicyExtrasTest.FIELD
                );
                expect(fieldElements).toHaveLength(numberOfFields);
            });
        });

        describe('generateFields', () => {
            it('should generate the correct number of fields', () => {
                renderComponent();
                const fields = screen.getAllByTestId(PolicyExtrasTest.FIELD);
                expect(fields).toHaveLength(numberOfFields);
            });

            it('each field should have a Label and Content component', () => {
                renderComponent();
                const fields = screen.getAllByTestId(PolicyExtrasTest.FIELD);

                fields.forEach((field) => {
                    // randomized text means we just have to check if it exists
                    expect(field).toHaveTextContent(new RegExp('.+', 'i'));
                    expect(field).toHaveTextContent(new RegExp('.+', 'i'));
                });
            });
        });
    });
});
