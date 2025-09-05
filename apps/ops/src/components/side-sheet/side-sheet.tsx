import { Transition } from '@headlessui/react';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { ReactNode, useEffect, useState } from 'react';
import FocusLock from 'react-focus-lock';

import PopoverOnTruncate from '@deps/components/popover-on-truncate/popover-on-truncate';
import { ReactComponent as CancelIcon } from '@deps/styles/elements/icons/actions/cancel.svg';

import IconButton from '../icon-button/icon-button';
import Typography, { TypographyVariant } from '../typography/typography';

export enum SideSheetLocation {
    Left = 'left',
    Right = 'right',
}

export interface SideSheetProps {
    open?: boolean;
    handleClose: () => void;
    location?: SideSheetLocation;
    header?: string;
    headerIcon?: JSX.Element;
    headerElement?: React.ReactNode;
    children?: ReactNode;
    displayItemCount?: boolean;
    closeOnEscape?: boolean;
    closeOnOutsideClick?: boolean;
    width?: number | string;
}

const transformStyle = (
    isRight: boolean,
    isLeft: boolean,
    open: boolean,
    isDelayedMount: boolean,
    width: number | string
) => {
    if (open && isDelayedMount) return 'translateX(0)';

    // If width is a number, use pixel transforms
    if (typeof width === 'number') {
        if (isRight) return `translateX(${width}px)`;
        if (isLeft) return `translateX(-${width}px)`;
    }

    // If width is a percentage string
    if (typeof width === 'string' && width.endsWith('%')) {
        if (isRight) return `translateX(${width})`;
        if (isLeft) return `translateX(-${width})`;
    }

    return '';
};

export default function SideSheet({
    open = false,
    location = SideSheetLocation.Right,
    handleClose,
    header = '',
    headerElement,
    children,
    displayItemCount = false,
    closeOnEscape = true,
    closeOnOutsideClick = true,
    width = 500,
}: SideSheetProps) {
    const [isDelayedMount, setIsDelayedMount] = useState(false);
    const { t } = useTranslation();
    useEffect(() => {
        const onKeyPress = (event: KeyboardEvent) => {
            if (closeOnEscape && open && event.key === 'Escape') handleClose();
        };

        window.addEventListener('keydown', onKeyPress);
        return () => window.removeEventListener('keydown', onKeyPress);
    }, [closeOnEscape, handleClose, open]);

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (open) {
            timeout = setTimeout(() => {
                setIsDelayedMount(true);
            }, 0);
            document.documentElement.style.overflow = 'hidden';
        }

        if (!open) {
            setIsDelayedMount(false);
            document.documentElement.style.overflow = '';
        }

        return () => {
            clearTimeout(timeout);
        };
    }, [open]);

    const isRight = location === SideSheetLocation.Right;
    const isLeft = location === SideSheetLocation.Left;

    const handleCloseOnOutsideClick = closeOnOutsideClick
        ? handleClose
        : undefined;

    const innerTransitionClasses = clsx(
        `pointer-events-auto fixed top-0 h-full w-screen transform bg-gradient-to-r from-accent1 to-accent2 pt-2 transition duration-300 ease-in-out sm:w-[500px] !min-w-[500px]`,
        {
            'right-0': isRight,
            'left-0': isLeft,
            'translate-x-0': open && isDelayedMount, // to
        }
    );

    const transform = transformStyle(
        isRight,
        isLeft,
        open,
        isDelayedMount,
        width
    );
    const widthStyle = typeof width === 'number' ? `${width}px` : width;
    // TODO: the side-sheet needs to accept and accessible name for the modal
    return (
        <div
            className="absolute z-20"
            role="dialog"
            aria-modal="true"
            aria-label={t('ariaLabel.sideSheet') as string}
        >
            <Transition show={open}>
                <FocusLock returnFocus={true}>
                    <Transition.Child
                        enter="transition-opacity"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div
                            onClick={handleCloseOnOutsideClick}
                            className="fixed inset-0 overflow-hidden bg-gray-500 bg-opacity-75"
                        />
                    </Transition.Child>

                    <div className="pointer-events-none fixed inset-0 overflow-hidden">
                        <div
                            className={innerTransitionClasses}
                            style={{ width: widthStyle, transform }}
                        >
                            <div className="flex h-full flex-col bg-white">
                                <div className="z-10 px-8 py-6 shadow-elevation-light-08">
                                    <div className="flex flex-row-reverse items-center justify-between">
                                        <div className="min-w-content ml-4 flex h-7 shrink-0 transition-all duration-300 ease-in-out">
                                            <IconButton
                                                onClick={handleClose}
                                                aria-label={
                                                    t(
                                                        'ariaLabel.closeSideSheet'
                                                    ) as string
                                                }
                                                data-testid="close-button"
                                            >
                                                <CancelIcon
                                                    width={24}
                                                    height={24}
                                                />
                                            </IconButton>
                                        </div>
                                        <div className="grow-1 flex min-w-0">
                                            {headerElement ? (
                                                headerElement
                                            ) : (
                                                <PopoverOnTruncate
                                                    title={`${header}${
                                                        displayItemCount
                                                            ? ' items.length'
                                                            : ''
                                                    }`}
                                                >
                                                    <div className="text-left">
                                                        <Typography
                                                            variant={
                                                                TypographyVariant.H2
                                                            }
                                                            className="text-gray-900"
                                                        >
                                                            {`${header}${
                                                                displayItemCount
                                                                    ? ' items.length'
                                                                    : ''
                                                            }`}
                                                        </Typography>
                                                    </div>
                                                </PopoverOnTruncate>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {children && (
                                    <div className="z-10 h-full overflow-y-scroll">
                                        {children}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </FocusLock>
            </Transition>
        </div>
    );
}
