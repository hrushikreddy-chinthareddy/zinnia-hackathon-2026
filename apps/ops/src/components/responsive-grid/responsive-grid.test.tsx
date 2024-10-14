import { faker } from '@faker-js/faker';
import { render, cleanup } from '@testing-library/react';
import React from 'react';

import { ResponsiveGridTest } from '@deps/jest/constants/test-id-constants';
import { generateFields } from '@deps/utils/mock/mockPolicyExtrasFields';
import { CssValue } from '@deps/utils/styles';

import ResponsiveGrid, { ResponsiveGridProps } from './responsive-grid';

describe('ResponsiveGrid', () => {
    const renderComponent = () => render(<ResponsiveGrid {...props}>{children}</ResponsiveGrid>);
    const createCSSValue = (): CssValue => `${faker.number.int(64)}px`;
    const numberOfFields = faker.number.int(32);
    const children = generateFields(numberOfFields);
    let props: ResponsiveGridProps;

    beforeEach(() => {
        props = {};
    });

    afterEach(cleanup);

    it('renders without crashing', () => {
        const { getByTestId } = renderComponent();
        const element = getByTestId(ResponsiveGridTest.CONTAINER);
        expect(element).toBeInTheDocument();
        expect(element.children).toHaveLength(numberOfFields);
    });

    describe('prop values', () => {
        const testPropValue = (propName: string, cssPropName: string) => {
            it(`applies ${propName} correctly`, () => {
                let propValue = createCSSValue();
                props = {
                    [propName]: propValue,
                };
                const { rerender, getByTestId } = renderComponent();
                const element = getByTestId(ResponsiveGridTest.CONTAINER);
                const style = getComputedStyle(element);
                expect(style.getPropertyValue(cssPropName)).toBe(propValue);

                propValue = createCSSValue();
                props = {
                    [propName]: propValue,
                };
                rerender(<ResponsiveGrid {...props}>{children}</ResponsiveGrid>);
                const updatedStyle = getComputedStyle(element);
                expect(updatedStyle.getPropertyValue(propValue));
            });
        };

        testPropValue('columnGap', '--responsive-grid-column-gap');
        testPropValue('rowGap', '--responsive-grid-row-gap');
        testPropValue('minItemWidth', '--responsive-grid-item--min-width');

        it('applies Tag correctly', () => {
            props = {
                Tag: 'div',
            };
            const { rerender, getByTestId } = renderComponent();
            const element = getByTestId(ResponsiveGridTest.CONTAINER);
            rerender(<ResponsiveGrid {...props}>{children}</ResponsiveGrid>);
            expect(element.tagName).toBe('DIV');
        });
        it('applies className Correctly', () => {
            const className = faker.lorem.word();
            props = {
                className,
            };
            const { getByTestId } = renderComponent();
            const element = getByTestId(ResponsiveGridTest.CONTAINER);
            expect(element).toHaveClass(className);
        });

        describe('props that need visual or e2e testing', () => {
            it.todo('maxColumns');
            it.todo('minItemWidth');
            it.todo('neverWrapText');
        });
    });
});
