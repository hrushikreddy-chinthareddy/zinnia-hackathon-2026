import {
    Icon,
    IconType,
    MenuContextual,
    MenuContextualItem,
} from '@zinnia/bloom/components';
import clsx from 'clsx';

import { IllustrationSummary } from '@deps/types/illustrations';
import { Product } from '@deps/types/product';

import styles from './illustration-item.module.css';
import StatusBadge from './status-badge';

interface IllustrationItemProps {
    illustration: IllustrationSummary;
    product: Product;
    isSelected?: boolean;
    onIllustrationSelected?: (
        product: Product,
        illustration: IllustrationSummary
    ) => void;
}

const IllustrationItem = ({
    illustration,
    product,
    isSelected,
    onIllustrationSelected,
}: IllustrationItemProps) => {
    return (
        <li
            className={clsx(
                styles.illustrationItem,
                isSelected && styles.selected
            )}
            onClick={() => onIllustrationSelected?.(product, illustration)}
        >
            <Icon type={IconType.DOCUMENT_REPORT} />
            <span>{illustration.title}</span>
            <div className={clsx(styles.status)}>
                <StatusBadge status={illustration.status} />
                <span className={clsx(styles.menu)}>
                    <MenuContextual
                        triggerLabel={<Icon type={IconType.MENU_HORIZONTAL} />}
                    >
                        <MenuContextualItem
                            disabled
                            content="Edit"
                            href="/"
                            icon={
                                <Icon
                                    type={IconType.EDIT}
                                    height={20}
                                    width={20}
                                />
                            }
                        />
                        <MenuContextualItem
                            disabled
                            content="Duplicate"
                            href="/"
                            icon={
                                <Icon
                                    type={IconType.DUPLICATE}
                                    height={20}
                                    width={20}
                                />
                            }
                        />
                        <MenuContextualItem
                            disabled
                            content="Archive"
                            href="/"
                            icon={
                                <Icon
                                    type={IconType.ARCHIVE}
                                    height={20}
                                    width={20}
                                />
                            }
                        />
                        <MenuContextualItem
                            content="Select for Application"
                            href="/"
                            icon={
                                <Icon
                                    type={IconType.CIRCLE_CHECKMARK}
                                    height={20}
                                    width={20}
                                />
                            }
                        />
                    </MenuContextual>
                </span>
            </div>
        </li>
    );
};

export default IllustrationItem;
