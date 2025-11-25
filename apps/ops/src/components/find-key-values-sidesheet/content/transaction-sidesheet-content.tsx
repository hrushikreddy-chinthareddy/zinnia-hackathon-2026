import {
    Button,
    FieldData,
    Icon,
    IconType,
    Label,
    FieldSize as BloomFieldSize,
    FieldTypes,
} from '@zinnia/bloom/components';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { useDebounce } from '@deps/hooks/useDebounce';
import { Transaction } from '@zinnia/api-types/types/sor';

import { KeyValueBasics } from '../components/key-value-basics';
import { KeyValueSections } from '../components/key-value-sections';
import styles from '../find-all-key-values-sidesheet.module.css';
import { prepareTransaction } from '../transformations';
import { Collapse, Expand, NestedData } from '../types';

export const TransactionSidesheetContent = ({
    transaction,
}: {
    transaction: Transaction;
}) => {
    const [treeState, setTreeState] = useState(Collapse);
    const [searchValue, setSearchValue] = useState('');
    const { t } = useTranslation();
    const { policy } = useContext(PolicyData);

    const debouncedSearchValue = useDebounce(searchValue, 200);
    useEffect(() => {
        if (!debouncedSearchValue) return;

        setTreeState(Expand);
    }, [debouncedSearchValue]);

    const preparedTransaction = useMemo(
        () =>
            prepareTransaction({
                transaction,
                policy,
                t,
                searchValue: debouncedSearchValue,
            }),
        [transaction, policy, debouncedSearchValue, t]
    );

    const { basics, sections } = useMemo(
        () =>
            preparedTransaction
                ? preparedTransaction.toSections()
                : {
                      basics: null,
                      sections: null,
                  },
        [preparedTransaction]
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
                        {treeState === Expand ? 'Collapse all' : 'Expand all'}
                    </Button>
                </div>
                {basics && (
                    <KeyValueBasics
                        policyBasics={basics as NestedData[]}
                        searchValue={searchValue}
                        treeState={treeState}
                    />
                )}

                {!!sections?.length && (
                    <KeyValueSections
                        preparedData={preparedTransaction}
                        sections={sections}
                        searchValue={searchValue}
                        treeState={treeState}
                    />
                )}

                {!basics && !sections?.length && (
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
