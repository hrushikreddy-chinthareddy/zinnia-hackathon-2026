import clsx from 'clsx';
import { PropsWithChildren, ReactNode } from 'react';

import TempNavInactive from '@deps/components/nav-element/temp-nav-inactive/temp-nav-inactive';
import ResponsiveFlex from '@deps/components/responsive-flex/responsive-flex';
import {
    HorizontalResizing,
    ItemPadding,
    ItemSpacing,
    LayoutAlignment,
    LayoutDirection,
} from '@deps/components/responsive-flex/responsive-flex.types';
import Tooltip, { PopoverPlacement } from '@deps/components/tooltip/tooltip';
import { JestProps } from '@deps/types/props';

enum SectionCardTest {
    Container = 'section-card-container-test-id',
}

export interface FooterContent {
    text: string;
    href: string;
    isDisabled?: boolean;
    onClick?: () => void;
    tooltip?: string;
    tempInactive?: boolean;
}

export type SectionCardProps = {
    headerContent?: ReactNode;
    footerContent?: FooterContent[];
    className?: string;
} & JestProps &
    PropsWithChildren;

const CardContainer = ResponsiveFlex;
const CardHeader = ResponsiveFlex;
const CardBody = ResponsiveFlex;

const SectionCard = ({ children, className, headerContent, footerContent, 'data-testid': testId }: SectionCardProps) => (
    <CardContainer
        data-testid={testId || SectionCardTest.Container}
        layoutDirection={LayoutDirection.Vertical}
        layoutAlignment={LayoutAlignment.TopLeft}
        horizontalResizing={HorizontalResizing.Fixed}
        itemPadding={ItemPadding.XSmall}
        className={clsx('border-gray-100 bg-white md:p-6 lg:p-8', className)}
    >
        <CardHeader horizontalResizing={HorizontalResizing.Hug} itemSpacing={ItemSpacing.XXSmall}>
            {headerContent}
        </CardHeader>
        <CardBody
            layoutDirection={LayoutDirection.Vertical}
            layoutAlignment={LayoutAlignment.TopEvenly}
            className="md:flex-row md:justify-start md:gap-8"
        >
            {children}
        </CardBody>
        {footerContent && (
            <div className="flex flex-wrap gap-4 bg-gray-50 py-4 md:flex-row md:gap-8 md:pl-6 lg:w-auto lg:self-stretch lg:pl-8">
                {footerContent.map(({ text, tempInactive, tooltip, href, isDisabled, onClick }) => (
                    // https://zinnia.atlassian.net/browse/DEPU-1936
                    <span key={`${text}-wrapper`}>
                        {tempInactive ? (
                            <TempNavInactive key={`${text}-tooltip`} tooltipBody={tooltip}>
                                {text}
                            </TempNavInactive>
                        ) : isDisabled ? (
                            tooltip ? (<Tooltip placement={PopoverPlacement.TopRight} body={tooltip} key={`${text}-tooltip`}>
                                <span
                                    className="cursor-not-allowed font-primary text-links-sm font-semibold text-gray-300"
                                    key={`${text}-link`}
                                >
                                    {text}
                                </span>
                            </Tooltip>) : (
                                <span
                                    className="cursor-not-allowed font-primary text-links-sm font-semibold text-gray-300"
                                    key={`${text}-link`}
                                >
                                    {text}
                                </span>
                            )
                        ) : (
                            <a href={href} key={`${text}-link`} className="font-primary text-links-sm font-semibold text-cerulean-600" data-testid={text} onClick={onClick}>
                                {text}
                            </a>
                        )}
                    </span>
                ))}
            </div>
        )}
    </CardContainer>
);

export default SectionCard;
