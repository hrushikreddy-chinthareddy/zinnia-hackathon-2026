import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';

import PageHeader, { PageHeaderProps } from './page-header';

afterEach(cleanup);

describe('PageHeader with icon, headerText', () => {
    const headerText = 'headerText';
    const icon = <div>icon</div>;
    const breadcrumbText = 'breadcrumbText';
    const breadcrumbUrl = 'breadcrumbUrl';
    const headerTextSiblingsGroupOne = (
        <div>Header text siblings group one</div>
    );
    const headerTextSiblingsGroupTwo = (
        <div>Header text siblings group two</div>
    );
    const belowHeaderTextChildren = <div>Below header text children</div>;

    let props: JSX.IntrinsicAttributes & PageHeaderProps;

    beforeEach(() => {
        props = { headerText };
        jest.clearAllMocks();
        jest.spyOn(console, 'warn').mockImplementation();
    });

    const renderComponent = () => render(<PageHeader {...props} />);

    it('renders headerText', () => {
        renderComponent();
        expect(screen.getAllByText(headerText)[0]).toBeInTheDocument();
    });

    it('renders headerText and icon', () => {
        props.icon = icon;
        renderComponent();
        expect(screen.getAllByText(headerText)[0]).toBeInTheDocument();
        const iconElement = screen.getByTestId('icon');
        expect(iconElement).toBeInTheDocument();
    });

    it('does not render breadcrumbText when breadcrumbUrl is not provided', () => {
        props.breadcrumbText = breadcrumbText;
        renderComponent();
        expect(screen.queryByText(breadcrumbText)).not.toBeInTheDocument();
    });

    it('renders breadcrumbText', () => {
        props.breadcrumbText = breadcrumbText;
        props.breadcrumbUrl = breadcrumbUrl;
        renderComponent();
        expect(screen.queryByText(breadcrumbText)).toBeInTheDocument();
    });

    it('renders header text siblings for group one', () => {
        props.headerTextSiblingsGroupOne = headerTextSiblingsGroupOne;
        renderComponent();
        const groupOneSiblings = screen.getByTestId('group-one-siblings');
        expect(groupOneSiblings).toBeInTheDocument();
    });

    it('renders header text siblings for group two', () => {
        props.headerTextSiblingsGroupTwo = headerTextSiblingsGroupTwo;
        renderComponent();
        const groupTwoSiblings = screen.getByTestId('group-two-siblings');
        expect(groupTwoSiblings).toBeInTheDocument();
    });

    it('renders below header text children', () => {
        props.belowHeaderTextChildren = belowHeaderTextChildren;
        renderComponent();
        const childrenBelow = screen.getByTestId('children-below');
        expect(childrenBelow).toBeInTheDocument();
    });
});
