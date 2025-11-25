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
import { Expand, useTreeState } from '@deps/hooks/useTreeState';
import { Transaction } from '@zinnia/api-types/types/sor';

import { DataNodeRenderer } from '../components/data-node-renderer';
import styles from '../find-all-key-values-sidesheet.module.css';
import { combinedTransform } from '../formatters';
import {
    convertNode,
    convertToDataNode,
    groupBasics,
    searchNodes,
    transformObject,
} from '../transformations';

export const TransactionSidesheetContent = ({
    transaction,
}: {
    transaction: Transaction;
}) => {
    const { treeState, setTreeState } = useTreeState();
    const [searchValue, setSearchValue] = useState('');
    const { t } = useTranslation();
    const debouncedSearchValue = useDebounce(searchValue, 200);

    useEffect(() => {
        if (!debouncedSearchValue) return;
        setTreeState(Expand);
    }, [debouncedSearchValue, setTreeState]);

    const nodes = convertToDataNode(
        (data) => convertNode(data, t),
        (data) => groupBasics(data, t),
        // remove groupSections
        // show / hide sections
        // translate section labels
        (data) => {
            return data
                .map((node) =>
                    transformObject(
                        node,
                        combinedTransform({
                            t,
                            exclude: ['timestamp', 'id', 'transactionAmounts'],
                        })
                    )
                )
                .filter(Boolean);
        }
    )(transaction);

    const matches = searchNodes(nodes, debouncedSearchValue);

    console.log(matches);

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
                {!matches.length && (
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
