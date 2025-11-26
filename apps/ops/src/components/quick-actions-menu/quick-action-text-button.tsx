import clsx from 'clsx';

import { ReactComponent as ChevronDown } from '@deps/styles/elements/icons/arrow/chevron-down.svg';

import styles from './quick-actions-menu.module.css';

export const TextButton = ({ label }: { label: string }) => {
    return (
        <div className={clsx('md:flex', styles.quickActions)}>
            <p className="text-links">{label}</p>
            <ChevronDown
                className="simple-transition group-data-[state=open]:rotate-180"
                height={16}
                width={16}
            />
        </div>
    );
};
