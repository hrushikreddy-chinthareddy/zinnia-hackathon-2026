import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import clsx from 'clsx';

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
}

const MenuContextualItem = ({
    content,
    icon,
    href,
    onClick,
    disabled,
    type = NavElementType.Link,
    openInNewTab,
}: MenuContextualItemProps) => {
    const handleSelect = () => {
        onClick && onClick();
    };

    return (
        <DropdownMenu.Item onSelect={handleSelect} disabled={disabled}>
            <NavElement
                className={clsx(
                    styles.menuContextualItem,
                    disabled && styles.disabled
                )}
                type={type}
                disabled={disabled}
                href={href}
                rel={openInNewTab ? 'noopener noreferrer' : undefined}
                target={openInNewTab ? '_blank' : undefined}
            >
                {icon && <span className={styles.icon}>{icon}</span>}
                <p>{content}</p>
            </NavElement>
        </DropdownMenu.Item>
    );
};

export default MenuContextualItem;
