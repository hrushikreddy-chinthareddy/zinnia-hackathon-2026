import { cleanup, render, screen } from '@testing-library/react';

import DetailsCard from '@deps/components/card/card-details';
import { CardDetailsTest } from '@deps/jest/constants/test-id-constants';

import '@testing-library/jest-dom';

const cardDetailsTitles = ['title-1', 'title-2'];

const cardDetailsItems = [
    <p key="1" data-testid={`${CardDetailsTest.ITEMS}-1`}>
        Item 1
    </p>,
    <p key="2" data-testid={`${CardDetailsTest.ITEMS}-2`}>
        Item 2
    </p>,
];

const cardDetailsHeader = <p>Card Details Header</p>;

afterEach(cleanup);

describe('Card Details Component', () => {
    it('should render an MUI card component', () => {
        render(
            <DetailsCard items={cardDetailsItems} titles={cardDetailsTitles} />
        );
        expect(screen.getByTestId(CardDetailsTest.CARD)).toBeInTheDocument();
    });

    it('should render each of the items from props', () => {
        render(
            <DetailsCard items={cardDetailsItems} titles={cardDetailsTitles} />
        );
        expect(
            screen.getByTestId(`${CardDetailsTest.ITEMS}-1`)
        ).toBeInTheDocument();
        expect(
            screen.getByTestId(`${CardDetailsTest.ITEMS}-2`)
        ).toBeInTheDocument();
    });

    it('should correctly display the titles from props', () => {
        render(
            <DetailsCard items={cardDetailsItems} titles={cardDetailsTitles} />
        );
        expect(screen.getByTestId(CardDetailsTest.CONTENT)).toBeInTheDocument();
        expect(screen.getByText(cardDetailsTitles[0])).toBeInTheDocument();
        expect(screen.getByText(cardDetailsTitles[1])).toBeInTheDocument();
    });

    it('should not render the card header if the header prop is undefined', () => {
        render(
            <DetailsCard
                items={cardDetailsItems}
                titles={cardDetailsTitles}
                header={undefined}
            />
        );
        expect(
            screen.queryByTestId(CardDetailsTest.HEADER)
        ).not.toBeInTheDocument();
    });

    it('should render the card header if the header prop is defined', () => {
        render(
            <DetailsCard
                items={cardDetailsItems}
                titles={cardDetailsTitles}
                header={cardDetailsHeader}
            />
        );
        expect(screen.getByTestId(CardDetailsTest.HEADER)).toBeInTheDocument();
    });
});
