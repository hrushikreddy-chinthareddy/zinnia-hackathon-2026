import clsx from 'clsx';
import { PropsWithChildren, ReactNode } from 'react';

import ResponsiveFlex from '@deps/components/responsive-flex/responsive-flex';
import {
    HorizontalResizing,
    ItemPadding,
    ItemSpacing,
    LayoutAlignment,
    LayoutDirection,
} from '@deps/components/responsive-flex/responsive-flex.types';
import { JestProps } from '@deps/types/props';

import FooterAction from '../card-footer-action/card-footer-action';

enum SectionCardTest {
    Container = 'section-card-container-test-id',
}

export interface FooterContent {
    text: string;
    href: string;
    isDisabled?: boolean;
    onClick?: (e?: React.MouseEvent) => void;
    tooltip?: string;
    tempInactive?: boolean;
}

export type SectionCardProps = {
    headerContent?: ReactNode;
    footerContent?: FooterContent[];
    className?: string;
    headerClassName?: string;
} & JestProps &
    PropsWithChildren;

const CardContainer = ResponsiveFlex;
const CardHeader = ResponsiveFlex;
const CardBody = ResponsiveFlex;

const SectionCard = ({
    children,
    className,
    headerContent,
    footerContent,
    headerClassName,
    'data-testid': testId,
}: SectionCardProps) => (
    <CardContainer
        data-testid={testId || SectionCardTest.Container}
        layoutDirection={LayoutDirection.Vertical}
        layoutAlignment={LayoutAlignment.TopLeft}
        horizontalResizing={HorizontalResizing.Fixed}
        itemPadding={ItemPadding.XSmall}
        className={clsx('border-gray-100 bg-white md:p-6 lg:p-8', className)}
    >
        <CardHeader
            horizontalResizing={HorizontalResizing.Hug}
            itemSpacing={ItemSpacing.XXSmall}
            className={headerClassName}
        >
            {headerContent}
        </CardHeader>
        <CardBody
            layoutDirection={LayoutDirection.Vertical}
            layoutAlignment={LayoutAlignment.TopEvenly}
            className="md:flex-row md:justify-start md:gap-8 w-full"
        >
            {children}
        </CardBody>
        {footerContent && (
            <div className="flex flex-wrap gap-4 bg-gray-50 py-4 md:flex-row md:gap-8 md:pl-6 lg:w-auto lg:self-stretch lg:pl-8">
                {footerContent.map((footerAction) => (
                    <FooterAction
                        key={`${footerAction.text}-wrapper`}
                        footerContent={footerAction}
                    />
                ))}
            </div>
        )}
    </CardContainer>
);

export default SectionCard;
