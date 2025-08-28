import { Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import Link from 'next/link';

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
}

const IllustrationItem = ({
    illustration,
    isSelected,
    isSelectableForApplication,
}: IllustrationItemProps) => {
    const { clientCaseId } = useSelectedIllustration();
    return (
        <li
            className={clsx(
                styles.illustrationItem,
                isSelected && styles.selected
            )}
        >
            <Link
                href={`/illustrations/client-cases/${clientCaseId}/illustrate/${illustration.id}`}
                shallow={true}
                className={styles.illustrationLink}
            >
                <Icon type={IconType.DOCUMENT_REPORT} />
                <span className="flex-1">{illustration.title}</span>
                <div className={clsx(styles.status)}>
                    <StatusBadge status={illustration.status} />
                </div>
            </Link>
            <span className={clsx(styles.menu)}>
                <IllustrationMenu
                    isSelectForApplicationVisible={isSelectableForApplication}
                ></IllustrationMenu>
            </span>
        </li>
    );
};

export default IllustrationItem;
