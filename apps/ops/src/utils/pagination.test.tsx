import { ReactElement } from 'react';

import PageNumbers from '@deps/components/pagination/page-numbers/page-numbers';
import Truncate from '@deps/components/pagination/truncate/truncate';
import { generatePageNumbers } from '@deps/utils/pagination';

// A mock function for goToPage
const goToPage = jest.fn();

describe('generatePageNumbers', () => {
    const checkPageNumbersAndTruncate = (
        result: ReactElement[],
        expectedNumbers: number[],
        shouldHaveTruncate: boolean
    ) => {
        result.forEach((element) => {
            if (element.type === Truncate) {
                expect(shouldHaveTruncate).toBeTruthy();
            } else {
                const pageNumber = expectedNumbers.shift();
                expect(element.type).toBe(PageNumbers);
                expect(element.props.pageNumber).toBe(pageNumber);
            }
        });
    };

    describe('on medium and large screens', () => {
        test('renders all numbers when the total pages is 8 (or below)', () => {
            const result: ReactElement[] = generatePageNumbers(
                1,
                8,
                goToPage
            ).md;
            expect(result.length).toBe(8);
            checkPageNumbersAndTruncate(
                result,
                [1, 2, 3, 4, 5, 6, 7, 8],
                false
            );
        });

        test('renders 1, 2, 3, 4, 5, 6, 7, 8, 12 , and ... if total pages = 12 and current page is 6', () => {
            const result: ReactElement[] = generatePageNumbers(
                6,
                12,
                goToPage
            ).md;
            expect(result.length).toBe(10);
            checkPageNumbersAndTruncate(
                result,
                [1, 2, 3, 4, 5, 6, 7, 8, 12],
                true
            );
        });

        test('renders 1, 5, 6, 7, 8, 9, 10, 11, 12 and ... if total pages = 12 and current page is 7', () => {
            const result: ReactElement[] = generatePageNumbers(
                7,
                12,
                goToPage
            ).md;
            expect(result.length).toBe(10);
            checkPageNumbersAndTruncate(
                result,
                [1, 5, 6, 7, 8, 9, 10, 11, 12],
                true
            );
        });

        test('renders 1, 2, 3, 4, 5, 6, 7, 8, 18 and ... if total pages = 18 and current page is first page', () => {
            const result: ReactElement[] = generatePageNumbers(
                1,
                18,
                goToPage
            ).md;
            expect(result.length).toBe(10);
            checkPageNumbersAndTruncate(
                result,
                [1, 2, 3, 4, 5, 6, 7, 8, 18],
                true
            );
        });

        test('renders 1, 2, 3, 4, 5, 6, 7, 8, 18 and ... if total pages = 18 and current page is 6', () => {
            const result: ReactElement[] = generatePageNumbers(
                6,
                18,
                goToPage
            ).md;
            expect(result.length).toBe(10);
            checkPageNumbersAndTruncate(
                result,
                [1, 2, 3, 4, 5, 6, 7, 8, 18],
                true
            );
        });

        test('renders 1, 4, 5, 6, 7, 8, 9, 10, 18 and ... if total pages = 18 and current page is 7', () => {
            const result: ReactElement[] = generatePageNumbers(
                7,
                18,
                goToPage
            ).md;
            expect(result.length).toBe(11);
            checkPageNumbersAndTruncate(
                result,
                [1, 4, 5, 6, 7, 8, 9, 10, 18],
                true
            );
        });

        test('renders 1, 9, 10, 11, 12, 13, 14, 15, 18 and ... if total pages = 18 and current page is 12', () => {
            const result: ReactElement[] = generatePageNumbers(
                12,
                18,
                goToPage
            ).md;
            expect(result.length).toBe(11);
            checkPageNumbersAndTruncate(
                result,
                [1, 9, 10, 11, 12, 13, 14, 15, 18],
                true
            );
        });

        test('renders 1, 11, 12, 13, 14, 15, 16, 17, 18 and ... if total pages = 18 and current page is 13', () => {
            const result: ReactElement[] = generatePageNumbers(
                13,
                18,
                goToPage
            ).md;
            expect(result.length).toBe(10);
            checkPageNumbersAndTruncate(
                result,
                [1, 11, 12, 13, 14, 15, 16, 17, 18],
                true
            );
        });

        test('renders 1, 11, 12, 13, 14, 15, 16, 17, 18 and ... if total pages = 18 and current page is last page', () => {
            const result: ReactElement[] = generatePageNumbers(
                18,
                18,
                goToPage
            ).md;
            expect(result.length).toBe(10);
            checkPageNumbersAndTruncate(
                result,
                [1, 11, 12, 13, 14, 15, 16, 17, 18],
                true
            );
        });
    });

    describe('on small screens', () => {
        test('renders all numbers when the total pages is 4 (or below) ', () => {
            const result: ReactElement[] = generatePageNumbers(
                3,
                4,
                goToPage
            ).sm;
            expect(result.length).toBe(4);
            checkPageNumbersAndTruncate(result, [1, 2, 3, 4], false);
        });

        test('renders 1, 2, 3, 4, 8, and ... when the total pages is 8 and current page is 1', () => {
            const result: ReactElement[] = generatePageNumbers(
                1,
                8,
                goToPage
            ).sm;
            expect(result.length).toBe(6);
            checkPageNumbersAndTruncate(result, [1, 2, 3, 4, 8], true);
        });

        test('renders 1, 2, 3, 4, 8, and ... when the total pages is 8 and current page is 3', () => {
            const result: ReactElement[] = generatePageNumbers(
                3,
                8,
                goToPage
            ).sm;
            expect(result.length).toBe(6);
            checkPageNumbersAndTruncate(result, [1, 2, 3, 4, 8], true);
        });

        test('renders 1, 3, 4, 5, 8, and ... when the total pages is 8 and current page is 4', () => {
            const result: ReactElement[] = generatePageNumbers(
                4,
                8,
                goToPage
            ).sm;
            expect(result.length).toBe(7);
            checkPageNumbersAndTruncate(result, [1, 3, 4, 5, 8], true);
        });

        test('renders 1, 5, 6, 7, 8, and ... when the total pages is 8 and current page is 6', () => {
            const result: ReactElement[] = generatePageNumbers(
                6,
                8,
                goToPage
            ).sm;
            expect(result.length).toBe(6);
            checkPageNumbersAndTruncate(result, [1, 5, 6, 7, 8], true);
        });
    });
});
