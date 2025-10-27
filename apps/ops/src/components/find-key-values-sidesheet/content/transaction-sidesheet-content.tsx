import { Transaction } from '@xd/api-types/dist/generated-types/sor';
import {
    Button,
    FieldData,
    Icon,
    IconType,
    Label,
    FieldSize as BloomFieldSize,
    FieldTypes,
} from '@zinnia/bloom/components';
import { useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { PolicyData } from '@deps/contexts/PolicyDataContext';

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
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'policy',
    });
    const { policy } = useContext(PolicyData);

    // const debouncedSearchValue = useDebounce(searchValue, 200);

    const preparedTransaction = prepareTransaction(transaction, policy, t, '');

    const { transactionDetails, transactionSections } = useMemo(
        () =>
            preparedTransaction
                ? preparedTransaction.toTransactionSections()
                : {
                      transactionDetails: null,
                      transactionSections: null,
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
                {transactionDetails && (
                    <KeyValueBasics
                        preparedData={preparedTransaction}
                        policyBasics={transactionDetails as NestedData[]}
                        searchValue={searchValue}
                        treeState={treeState}
                    />
                )}

                {!!transactionSections?.length && (
                    <KeyValueSections
                        preparedData={preparedTransaction}
                        sections={transactionSections}
                        searchValue={searchValue}
                        treeState={treeState}
                    />
                )}

                {!transactionDetails && !transactionSections?.length && (
                    <div className={styles.emptySearch}>
                        <Label>
                            <Icon
                                type={IconType.CIRCLE_INFO}
                                small={true}
                                className={styles.infoIcon}
                            />
                            {t('policy.allFields.emptySearch')}
                        </Label>
                    </div>
                )}
            </div>
        </div>
    );
};
