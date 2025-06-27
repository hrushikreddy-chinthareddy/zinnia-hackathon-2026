import { Disclosure, Transition } from '@headlessui/react';
import { MouseEventHandler, ReactNode } from 'react';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { ReactComponent as ChevronDown } from '@deps/styles/elements/icons/arrow/chevron-down.svg';

interface AccordionProps {
    title?: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    renderHeaderComponent?: React.ReactNode;
    children: ReactNode;
    isOpen?: boolean;
}

const Accordion = ({
    title,
    children,
    isOpen = false,
    renderHeaderComponent,
    onClick,
}: AccordionProps) => {
    return (
        <div className="shadow-sm">
            <Disclosure defaultOpen={isOpen}>
                {({ open }) => (
                    <>
                        <Disclosure.Button
                            onClick={onClick}
                            className={`flex w-full items-start justify-between bg-white p-8 text-left font-primary ${
                                open ? '!bg-gray-50' : ''
                            }`}
                        >
                            {title ? (
                                <Typography variant={TypographyVariant.H2}>
                                    {title}
                                </Typography>
                            ) : null}
                            {renderHeaderComponent
                                ? renderHeaderComponent
                                : null}
                            <ChevronDown
                                height={24}
                                width={24}
                                className={
                                    'simple-transition self-center text-secondary ' +
                                    (open ? '' : 'flip180')
                                }
                            />
                        </Disclosure.Button>
                        <Transition
                            as={'div'}
                            className={'w-full'}
                            enter="transition ease-out duration-200"
                            enterFrom="opacity-0 -translate-y-1"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 -translate-y-1"
                            show={open}
                        >
                            <Disclosure.Panel className="bg-white p-8">
                                {children}
                            </Disclosure.Panel>
                        </Transition>
                    </>
                )}
            </Disclosure>
        </div>
    );
};

export default Accordion;
