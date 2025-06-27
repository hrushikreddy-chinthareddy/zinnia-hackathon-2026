import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';

import { CardColumnsTest } from '@deps/jest/constants/test-id-constants';

import CardColumns from './card-columns';

const cardColumnsTitles = ['title-1', 'title-2'];

const cardColumnsItems = [
    <p key="1" data-testid={`${CardColumnsTest.ITEMS}-1`}>
        Item 1
    </p>,
    <p key="2" data-testid={`${CardColumnsTest.ITEMS}-2`}>
        Item 2
    </p>,
];

afterEach(cleanup);

describe('Card Columns Component', () => {
    it('should render an MUI grid component', () => {
        render(
            <CardColumns items={cardColumnsItems} titles={cardColumnsTitles} />
        );
        expect(screen.getByTestId(CardColumnsTest.COLUMNS)).toBeInTheDocument();
    });

    it('should render each of the titles from props', () => {
        render(
            <CardColumns items={cardColumnsItems} titles={cardColumnsTitles} />
        );
        expect(
            screen.getByTestId(
                `${CardColumnsTest.ITEMS}-${cardColumnsTitles[0]}`
            )
        ).toBeInTheDocument();
        expect(
            screen.getByTestId(
                `${CardColumnsTest.ITEMS}-${cardColumnsTitles[1]}`
            )
        ).toBeInTheDocument();
    });

    it('should render each of the items from props', () => {
        render(
            <CardColumns items={cardColumnsItems} titles={cardColumnsTitles} />
        );
        expect(
            screen.getByTestId(`${CardColumnsTest.ITEMS}-1`)
        ).toBeInTheDocument();
        expect(
            screen.getByTestId(`${CardColumnsTest.ITEMS}-2`)
        ).toBeInTheDocument();
    });
});
