import { Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';

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
    product,
    isSelected,
    isSelectableForApplication,
}: IllustrationItemProps) => {
    const { handleSelectIllustration } = useSelectedIllustration();
    return (
        <li
            className={clsx(
                styles.illustrationItem,
                isSelected && styles.selected
            )}
            onClick={() => handleSelectIllustration(product, illustration)}
        >
            <Icon type={IconType.DOCUMENT_REPORT} />
            <span className="flex-1">{illustration.title}</span>
            <div className={clsx(styles.status)}>
                <StatusBadge status={illustration.status} />
                <span className={clsx(styles.menu)}>
                    <IllustrationMenu
                        isSelectForApplicationVisible={
                            isSelectableForApplication
                        }
                    ></IllustrationMenu>
                </span>
            </div>
        </li>
    );
};

export default IllustrationItem;
