import { ReactComponent as ChevronDown } from '@deps/styles/elements/icons/arrow/chevron-down.svg';

import styles from './quick-actions-menu.module.css';
interface TextButtonProps {
    label: string;
    chevronPosition?: 'start' | 'end';
}

export const TextButton = ({
    label,
    chevronPosition = 'end',
}: TextButtonProps) => {
    const chevron = (
        <ChevronDown
            className="simple-transition group-data-[state=open]:rotate-180"
            height={16}
            width={16}
        />
    );

    return (
        <div className={styles.quickActions}>
            {chevronPosition === 'start' && chevron}
            <p className="text-links">{label}</p>
            {chevronPosition === 'end' && chevron}
        </div>
    );
};
