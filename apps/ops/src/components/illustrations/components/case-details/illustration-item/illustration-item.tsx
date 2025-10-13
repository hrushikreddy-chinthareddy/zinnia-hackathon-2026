import { Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import Link from 'next/link';
import { ReactNode } from 'react';

import { useSelectedIllustration } from '@deps/components/illustrations/providers/SelectedIllustrationProvider';
import { IllustrationSummary } from '@deps/types/illustrations';
import { Product } from '@deps/types/product';

import styles from './illustration-item.module.css';
import IllustrationMenu from './illustration-menu';
import StatusBadge from './status-badge';

interface IllustrationItemProps {
    illustration: IllustrationSummary;
    product: Product;
    isSelected?: boolean;
    isSelectableForApplication?: boolean;
    children?: ReactNode;
}

const IllustrationItem = ({
    illustration,
    isSelected,
    isSelectableForApplication,
    children,
}: IllustrationItemProps) => {
    const { clientCaseId } = useSelectedIllustration();
    return (
        <li
            className={clsx(styles.illustrationItem, {
                [styles.selected]: isSelected,
            })}
        >
            <Link
                href={`/illustrations/client-cases/${clientCaseId}/illustrate/${illustration.id}`}
                shallow
                className={styles.illustrationLink}
            >
                <Icon type={IconType.DOCUMENT_REPORT} />
                <span className="flex-1">{illustration.title}</span>
                <div className={clsx(styles.status)}>
                    <StatusBadge status={illustration.status} />
                </div>
                <span>
                    <IllustrationMenu
                        isSelectForApplicationVisible={
                            isSelectableForApplication
                        }
                    />
                </span>
            </Link>

            {children}
        </li>
    );
};

export default IllustrationItem;
