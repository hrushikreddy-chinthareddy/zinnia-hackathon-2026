import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import clsx from 'clsx';
import { useRouter } from 'next/router';

import NavElement, {
    NavElementType,
} from '@deps/components/nav-element/nav-element';

import styles from './menu-contextual-item.module.css';

export interface MenuContextualItemProps {
    content: string;
    href?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    type?: NavElementType;
    disabled?: boolean;
    openInNewTab?: boolean;
    'data-testid'?: string;
}

const MenuContextualItem = ({
    content,
    icon,
    href,
    onClick,
    disabled,
    openInNewTab,
    'data-testid': dataTestId,
}: MenuContextualItemProps) => {
    const router = useRouter();
    const handleSelect = () => {
        onClick && onClick();

        if (!openInNewTab && href) {
            router.push(href);
        }
    };

    return (
        <DropdownMenu.Item
            onSelect={handleSelect}
            disabled={disabled}
            data-testid={dataTestId}
        >
            <NavElement
                className={clsx(
                    styles.menuContextualItem,
                    disabled && styles.disabled
                )}
                type={href ? NavElementType.Link : NavElementType.Button}
                disabled={disabled}
                href={href}
                rel={openInNewTab ? 'noopener noreferrer' : undefined}
                target={openInNewTab ? '_blank' : undefined}
            >
                {icon && <span className={styles.icon}>{icon}</span>}
                <span>{content}</span>
            </NavElement>
        </DropdownMenu.Item>
    );
};

export default MenuContextualItem;
