import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useRouter } from 'next/router';

import NavElement, { NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';

export interface MenuContextualItemProps {
    content: string;
    href: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    openInNewTab?: boolean;
    replace?: boolean;
}

const MenuContextualItem = ({ content, icon, href, onClick, disabled, openInNewTab, replace = false }: MenuContextualItemProps) => {
    const router = useRouter();

    const handleSelect = () => {
        onClick && onClick();

        !openInNewTab && router.push(href);
    };

    return (
        <DropdownMenu.Item onSelect={handleSelect} disabled={disabled}>
            <NavElement
                className={
                    !disabled
                        ? 'default-focus flex items-center gap-2 self-stretch rounded-sm px-4 py-0 text-white hover:bg-gray-800 active:bg-white active:text-gray-900'
                        : 'disabled flex cursor-not-allowed items-center gap-2 self-stretch rounded-sm px-4 py-0 text-gray-300 '
                }
                variant={disabled ? undefined : NavElementVariant.Text}
                type={NavElementType.Link}
                disabled={disabled}
                href={href}
                rel={openInNewTab ? 'noopener noreferrer' : undefined}
                target={openInNewTab ? '_blank' : undefined}
                replace={replace}
            >
                {icon}
                <p className="whitespace-nowrap font-primary text-md font-light leading-6">{content}</p>
            </NavElement>
        </DropdownMenu.Item>
    );
};

export default MenuContextualItem;
