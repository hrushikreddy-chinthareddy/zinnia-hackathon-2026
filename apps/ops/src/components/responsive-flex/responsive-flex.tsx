import clsx from 'clsx';
import React, { CSSProperties, ElementType, PropsWithChildren } from 'react';

import { JestProps } from '@deps/types/props';

import {
    LayoutDirection,
    LayoutAlignment,
    HorizontalResizing,
    VerticalResizing,
    ItemPadding,
    ItemSpacing,
    ResponsiveFlexTest,
} from './responsive-flex.types';

/**
 * Props for ResponsiveFlex component.
 * @typedef {Object} ResponsiveFlexProps
 */
export type ResponsiveFlexProps = {
    layoutDirection?: LayoutDirection;
    layoutAlignment?: LayoutAlignment;
    verticalResizing?: VerticalResizing;
    horizontalResizing?: HorizontalResizing;
    itemPadding?: ItemPadding;
    itemSpacing?: ItemSpacing;
    Tag?: ElementType;
    className?: string;
    style?: CSSProperties;
} & PropsWithChildren &
    JestProps;

/**
 * A responsive flex container component that adjusts its layout based on the content and specified props.
 * @param {ResponsiveFlexProps} props - The props for the component.
 * @returns {JSX.Element} The rendered component.
 */
const ResponsiveFlex = ({
    layoutDirection = LayoutDirection.Horizontal,
    layoutAlignment = LayoutAlignment.MiddleLeft,
    verticalResizing = VerticalResizing.Hug,
    horizontalResizing = HorizontalResizing.Fill,
    itemSpacing = ItemSpacing.XSmall,
    itemPadding = ItemPadding.None,
    children,
    className,
    'data-testid': dataTestId,
    Tag = 'div',
    style,
}: ResponsiveFlexProps) => (
    <Tag
        data-testid={dataTestId || ResponsiveFlexTest.Container}
        style={style}
        className={clsx(
            verticalResizing,
            horizontalResizing,
            itemSpacing,
            itemPadding,
            layoutDirection,
            layoutAlignment,
            className
        )}
    >
        {children}
    </Tag>
);

export default ResponsiveFlex;
