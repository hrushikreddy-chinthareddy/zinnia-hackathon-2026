import {
    Button,
    FieldData,
    Icon,
    IconType,
    Label,
    FieldSize as BloomFieldSize,
    FieldTypes,
} from '@zinnia/bloom/components';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useDebounce } from '@deps/hooks/useDebounce';
import { Transaction } from '@zinnia/api-types/types/sor';

import { DataNodeRenderer } from '../components/data-node-renderer';
import styles from '../find-all-key-values-sidesheet.module.css';
import { convertNode } from '../transformations';
import { Collapse, Expand } from '../types';

export const TransactionSidesheetContent = ({
    transaction,
}: {
    transaction: Transaction;
}) => {
    const [treeState, setTreeState] = useState(Collapse);
    const [searchValue, setSearchValue] = useState('');
    const { t } = useTranslation();

    const debouncedSearchValue = useDebounce(searchValue, 200);
    useEffect(() => {
        if (!debouncedSearchValue) return;

        setTreeState(Expand);
    }, [debouncedSearchValue]);

    const nodes = convertNode(transaction, t);

    return (
        <div className={styles.keyValuesContainer}>
            <FieldData
                onChange={(e) => setSearchValue(e.target.value)}
                handleClear={() => setSearchValue('')}
                value={searchValue}
                fieldType={FieldTypes.Search}
                fieldSize={BloomFieldSize.Small}
                placeholder="Search"
            />

            <div className={styles.container}>
                <div className={styles.treeControl}>
                    <Button
                        mode="link"
                        size="small"
                        onClick={() => setTreeState((treeState) => !treeState)}
                        className={styles.treeControlButton}
                    >
                        <Icon
                            type={IconType.CHEVRON_DOUBLE}
                            width={18}
                            height={18}
                            className={styles.treeControlIcon}
                        />
                        {treeState === Expand ? 'Collapse all' : 'Expand all'}
                    </Button>
                </div>
                <DataNodeRenderer nodes={nodes} />
                {!nodes.length && (
                    <div className={styles.emptySearch}>
                        <Label>
                            <Icon
                                type={IconType.CIRCLE_INFO}
                                small={true}
                                className={styles.infoIcon}
                            />
                            {t('allFields.emptySearch')}
                        </Label>
                    </div>
                )}
            </div>
        </div>
    );
};
