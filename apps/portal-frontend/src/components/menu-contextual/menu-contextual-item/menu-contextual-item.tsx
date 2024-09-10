import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useRouter } from 'next/router';

export interface MenuContextualItemProps {
    content: string;
    href: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
}

const MenuContextualItem = ({ content, icon, href, onClick, disabled }: MenuContextualItemProps) => {
    const router = useRouter();

    const handleSelect = () => {
        onClick && onClick();
        router.push(href);
    };

    return (
        <DropdownMenu.Item onSelect={handleSelect} disabled={disabled}>
            <a
                className={
                    !disabled
                        ? 'default-focus flex items-center gap-2 self-stretch rounded-sm px-4 py-0 text-white hover:bg-gray-800 active:bg-white active:text-gray-900'
                        : 'disabled flex cursor-not-allowed items-center gap-2 self-stretch rounded-sm px-4 py-0 text-gray-600'
                }
                href={!disabled ? href : undefined}
            >
                {icon}
                <p className="whitespace-nowrap font-primary text-md font-light leading-6">{content}</p>
            </a>
        </DropdownMenu.Item>
    );
};

export default MenuContextualItem;

