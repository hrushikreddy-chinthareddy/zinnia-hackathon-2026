import { CSSProperties, ElementType, PropsWithChildren } from 'react';

import { filterTruthyProps } from '@deps/helpers/data-transform.helpers';
import { ResponsiveGridTest } from '@deps/jest/constants/test-id-constants';
import { CssValue } from '@deps/utils/styles';

/**
 * Props for ResponsiveGrid component.
 * @typedef {Object} ResponsiveGridProps
 * @property {number} [columns=6] - Number of columns in the grid.
 * @property {CssValue} [minItemWidth] - Minimum width for each item.
 * @property {CssValue} [columnGap] - Gap between columns.
 * @property {CssValue} [rowGap] - Gap between rows.
 * @property {ElementType} [Tag='ul'] - HTML tag for the container element.
 * @property {boolean} [neverWrapText=false] - Whether text within items should never wrap.
 */
export type ResponsiveGridProps = {
    maxColumns?: number;
    minItemWidth?: CssValue;
    columnGap?: CssValue;
    rowGap?: CssValue;
    Tag?: ElementType;
    neverWrapText?: boolean;
    className?: string;
} & PropsWithChildren;

/**
 * A responsive grid container component that adjusts its layout based on the content and specified props.
 * @param {ResponsiveGridProps} props - The props for the component.
 * @returns {JSX.Element} The rendered component.
 */
const ResponsiveGrid = ({ maxColumns = 4, columnGap, rowGap, minItemWidth, children, className = '', Tag = 'ul' }: ResponsiveGridProps) => (
    <Tag
        data-testid={ResponsiveGridTest.CONTAINER}
        className={`responsive-grid w-full ${className}`}
        style={
            filterTruthyProps({
                '--responsive-grid-column-count': maxColumns,
                '--responsive-grid-item--min-width': minItemWidth,
                '--responsive-grid-column-gap': columnGap,
                '--responsive-grid-row-gap': rowGap,
            }) as CSSProperties
        }
    >
        {children}
    </Tag>
);

export default ResponsiveGrid;
