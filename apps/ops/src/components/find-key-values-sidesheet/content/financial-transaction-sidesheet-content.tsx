import {
    Button,
    FieldData,
    Icon,
    IconType,
    FieldSize as BloomFieldSize,
    FieldTypes,
    Label,
} from '@zinnia/bloom/components';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useDebounce } from '@deps/hooks/useDebounce';
import { Expand, useTreeState } from '@deps/hooks/useTreeState';
import { FinancialTransactionRecord } from '@deps/models/case/financial-transactions';
import { DEBOUNCE_INTERVAL_200 } from '@deps/types/constants';

import { DataNodesRenderer } from '../components/data-node-renderer';
import styles from '../find-all-key-values-sidesheet.module.css';
import { searchNodes } from '../transformations/node-visibility';
import { getFinancialTransactions } from '../transformations/section-grouping';

export const FinancialTransactionSidesheetContent = ({
    financialTransaction,
}: {
    financialTransaction: FinancialTransactionRecord;
}) => {
    const { treeState, setTreeState, searchValue, setSearchValue } =
        useTreeState();

    const { entity } = financialTransaction;

    const debouncedSearchValue = useDebounce(
        searchValue,
        DEBOUNCE_INTERVAL_200
    );
    const { t } = useTranslation();

    const transactionNodes = useMemo(() => {
        return getFinancialTransactions(entity, t);
    }, [entity, t]);

    const matches = useMemo(
        () => searchNodes(transactionNodes, debouncedSearchValue),
        [transactionNodes, debouncedSearchValue]
    );

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
                        {treeState === Expand
                            ? t('allFields.collapseAll')
                            : t('allFields.expandAll')}
                    </Button>
                </div>

                <DataNodesRenderer nodes={matches} />
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
