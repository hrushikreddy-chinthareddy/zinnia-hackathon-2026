import React, { ElementType, PropsWithChildren } from 'react';

/**
 * Props for ResponsivePadding component.
 * @typedef {Object} ResponsivePaddingProps
 * @property {ElementType} [Tag='section'] - HTML tag for the container element.
 * @property {string} [className] - Additional class to add to the component
 */
export type ResponsivePaddingProps = {
    className?: string;
    Tag?: ElementType;
} & PropsWithChildren;

/**
 * The responsive padding component encasulates the standard 16px, 24px, 32px responsive padding
 * @param {ResponsivePaddingProps} props - The props for the component.
 * @returns {JSX.Element} The rendered component.
 */
const ResponsivePadding = ({ children, className = '', Tag = 'section' }: ResponsivePaddingProps) => (
    <Tag className={`p-4 md:p-6 lg:p-8 ${className}`}>{children}</Tag>
);

export default ResponsivePadding;
