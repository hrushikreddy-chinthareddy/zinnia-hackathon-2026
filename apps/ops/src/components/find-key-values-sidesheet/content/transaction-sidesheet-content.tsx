import { useQueryClient } from '@tanstack/react-query';
import {
    Button,
    FieldData,
    Icon,
    IconType,
    Label,
    FieldSize as BloomFieldSize,
    FieldTypes,
} from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useEffect, useMemo, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { useDebounce } from '@deps/hooks/useDebounce';
import { usePolicyQuery } from '@deps/hooks/usePolicyQuery';
import { Expand, useTreeState } from '@deps/hooks/useTreeState';
import { NUMERIC_DATE_FORMAT } from '@deps/types/constants';
import useQueryStore from '@deps/utils/queryStore';
import { Transaction } from '@zinnia/api-types/types/sor';

import { DataNodeRenderer } from '../components/data-node-renderer';
import {
    applyTransformationsToNodes,
    spruceFromSourceData,
    transformNodes,
} from '../data-node-helpers/mutations';
import styles from '../find-all-key-values-sidesheet.module.css';
import {
    excludeNodesByLabel,
    searchNodes,
} from '../transformations/node-visibility';
import {
    groupTaxesSection,
    groupBasicsForTransaction,
    getAllParties,
} from '../transformations/section-grouping';
import {
    addLinkToPartyId,
    addToolTip,
    formatNode,
} from '../transformations/formatters';

export const TransactionSidesheetContent = ({
    transaction,
}: {
    transaction: Transaction;
}) => {
    const { treeState, setTreeState, searchValue, setSearchValue } =
        useTreeState();
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [params] = useQueryStore();
    const { planCode, id } = params;
    const { data: policy } = usePolicyQuery(
        String(planCode),
        String(id),
        dayjs(new Date()).format(NUMERIC_DATE_FORMAT), // Don't know if this is right, but we don't filter transactions by date
        queryClient,
        true
    );

    const debouncedSearchValue = useDebounce(searchValue, 200);

    // the map of partyId to party data is used to link party names within parties fields
    const allPartiesById = useMemo(() => {
        if (!policy) {
            return undefined;
        }
        const policyNodes = spruceFromSourceData(policy, t);
        const { allPartiesById } = getAllParties({
            //FIXME: shoudln't run this often
            policyNodes,
            t,
            planCode: String(planCode),
            policyNumber: String(id),
        });
        return allPartiesById;
    }, [policy, t]);

    const transactionNodes = useMemo(() => {
        if (!allPartiesById) {
            return [];
        }

        // Chains transformations for the entire tree
        return applyTransformationsToNodes(
            // Spruce will take an arbitrary data structure, and
            // convert it into a structure that can be rendered
            (nodes) => spruceFromSourceData(nodes, t),
            (nodes) => groupBasicsForTransaction(nodes),
            (nodes) => groupTaxesSection(nodes),
            (nodes) =>
                // Transforms the entire tree, chaining transformations on *each node*
                transformNodes({
                    nodes,
                    transforms: [
                        (node) =>
                            excludeNodesByLabel({
                                node,
                            }),
                        (node) =>
                            addLinkToPartyId({
                                node,
                                planCode: String(planCode),
                                policyNumber: String(id),
                                allPartiesById,
                            }),
                        (node) =>
                            addToolTip({
                                node,
                                t,
                            }),
                        (node) =>
                            formatNode({
                                node,
                                t,
                            }),
                    ],
                })
        )(transaction);
    }, [transaction, allPartiesById, planCode, id, t]);

    const matches = useMemo(
        () => searchNodes(transactionNodes, debouncedSearchValue),
        [transactionNodes, debouncedSearchValue]
    );

    useEffect(() => {
        if (!debouncedSearchValue) return;
        setTreeState(Expand);
        setSearchValue(debouncedSearchValue);
    }, [debouncedSearchValue, setTreeState, setSearchValue]);

    return (
        <div className={styles.keyValuesContainer}>
            <FieldData
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setSearchValue(e.target.value)
                }
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
                <DataNodeRenderer nodes={matches} />
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
