import { fireEvent, render, screen } from '@testing-library/react';

import { toSentenceCase } from '@deps/helpers/string.helper';
import { PolicyExtrasTest, PopoverTest } from '@deps/jest/constants/test-id-constants';

import PolicyExtrasHeader, { PolicyExtrasHeaderProps } from './policy-extras-header';
import { ContentVariant } from '../content/content';

describe('PolicyExtrasHeader', () => {
    const headerText = 'header text';
    const sentenceCaseHeaderText = toSentenceCase(headerText);
    const labelText = 'label text';
    const sentenceCaseLabelText = toSentenceCase(labelText);
    const subheader = ['subheader 1'];

    let props: JSX.IntrinsicAttributes & PolicyExtrasHeaderProps;

    beforeEach(() => {
        props = {
            headerText,
            subheader,
            labelText,
        };
    });

    const renderComponent = () => render(<PolicyExtrasHeader {...props} />);

    describe('Layout', () => {
        it('renders correctly', () => {
            renderComponent();
            const headerElement = screen.getByTestId(PolicyExtrasTest.CONTAINER);
            expect(headerElement).toBeInTheDocument();
            expect(headerElement).toHaveClass('flex', 'flex-col', 'justify-start', 'content-start');
        });
    });

    describe('Header', () => {
        it('renders text in sentence case', () => {
            renderComponent();
            const headerElement = screen.getByText(sentenceCaseHeaderText);
            expect(headerElement).toBeInTheDocument();
        });

        it('meets design requirements', () => {
            renderComponent();
            const headerElement = screen.getByText(sentenceCaseHeaderText);
            expect(headerElement).toHaveClass('subtitle');
        });
    });

    describe('Subheader', () => {
        it('renders node', () => {
            renderComponent();
            // need to use test id instead of text because
            // <b> breaks the matcher
            const subheaderElement = screen.getByTestId(PolicyExtrasTest.SUBHEADER);
            expect(subheaderElement).toBeInTheDocument();
        });

        it('meets design requirements', () => {
            renderComponent();
            const subheaderElement = screen.getByTestId(PolicyExtrasTest.SUBHEADER);
            const subheaderContainer = subheaderElement.parentElement;
            expect(subheaderContainer).toHaveClass(`content-${ContentVariant.Body}`);
        });
    });

    describe('Label', () => {
        it('renders correct content in title case', () => {
            renderComponent();
            const labelElement = screen.getByText(sentenceCaseLabelText);
            expect(labelElement).toBeInTheDocument();
        });

        it('meets design requirements', () => {
            renderComponent();
            const labelElement = screen.getByText(sentenceCaseLabelText);
            expect(labelElement).toHaveClass('typography-labels-field-label');
        });

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
            const popoverTitle = await screen.findByTestId(PopoverTest.Popover);
            const popoverBody = await screen.findByTestId(PopoverTest.Body);
            const requiredElements = [popoverElement, popoverBody, popoverTitle];
            requiredElements.forEach(element => expect(element).toBeInTheDocument());
        });
    });
});
