import { useQueryClient } from '@tanstack/react-query';
import {
    Button,
    FieldData,
    Icon,
    IconType,
    Label,
    FieldSize as BloomFieldSize,
    FieldTypes,
    Loader,
    LoaderVariant,
} from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useEffect, useMemo, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import SidesheetCancelPending from '@deps/components/side-sheet/side-sheet-transaction/cancel-pending/side-sheet-cancel-pending';
import SidesheetReverseRecreate from '@deps/components/side-sheet/side-sheet-transaction/reverse-recreate/side-sheet-reverse-recreate';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { useViewState } from '@deps/contexts/ViewStateContext';
import { useDebounce } from '@deps/hooks/useDebounce';
import { usePolicyQuery } from '@deps/hooks/usePolicyQuery';
import { Expand, useTreeState } from '@deps/hooks/useTreeState';
import { NUMERIC_DATE_FORMAT } from '@deps/types/constants';
import useQueryStore from '@deps/utils/queryStore';
import { Transaction } from '@zinnia/api-types/types/sor';

import { DataNodesRenderer } from '../components/data-node-renderer';
import {
    applyTransformationsToNodes,
    buildRenderTreeFromSourceData,
    transformNodes,
} from '../data-node-helpers/mutations';
import styles from '../find-all-key-values-sidesheet.module.css';
import TransactionSidesheetActions from '../transaction-sidesheet-actions';
import {
    addLinkToPartyId,
    addToolTip,
    formatNode,
} from '../transformations/formatters';
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
    getReversalTransactionId,
    getTransactionAmount,
    TransactionSidesheetViews,
} from '../utils';

export const TransactionSidesheetContent = ({
    transaction,
    onTransactionSubmit,
}: {
    transaction: Transaction;
    onTransactionSubmit?: () => void;
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
    const { viewState, setViewState } = useViewState();
    const { handleOpen } = useSideSheetContext();

    const debouncedSearchValue = useDebounce(searchValue, 200);

    // the map of partyId to party data is used to link party names within parties fields
    const allPartiesById = useMemo(() => {
        if (!policy) {
            return undefined;
        }
        const policyNodes = buildRenderTreeFromSourceData(policy, t);
        const { allPartiesById } = getAllParties({
            //FIXME: shoudln't run this often
            policyNodes,
            t,
            planCode: String(planCode),
            policyNumber: String(id),
        });
        return allPartiesById;
    }, [policy, t, id, planCode]);

    const transactionNodes = useMemo(() => {
        if (!allPartiesById) {
            return [];
        }

        // Chains transformations for the entire tree
        return applyTransformationsToNodes(
            // buildRenderTreeFromSourceData will take an arbitrary data structure, and
            // convert it into a structure that can be rendered
            // Full docs here: https://zinnia.atlassian.net/wiki/spaces/AU/pages/5738889232/Rendering+Data+Trees
            (nodes) => buildRenderTreeFromSourceData(nodes, t),
            (nodes) => groupBasicsForTransaction(nodes), // Groups all top-level DataField nodes into a section
            (nodes) => groupTaxesSection(nodes), // Combines various data into a Taxes section
            (nodes) =>
                // Transforms the entire tree, chaining transformations on *each node*
                transformNodes({
                    nodes,
                    transforms: [
                        (node) =>
                            // Excludes sections and fields that are required to be hidden
                            excludeNodesByLabel({
                                node,
                            }),
                        (node) =>
                            // Adds a link to any partyId fields
                            addLinkToPartyId({
                                node,
                                planCode: String(planCode),
                                policyNumber: String(id),
                                allPartiesById,
                            }),
                        (node) =>
                            // Adds a tooltip to the node if it exists in the tooltip mapping
                            addToolTip({
                                node,
                                t,
                            }),
                        (node) =>
                            // Applies translations and formats dates, currencies, etc.
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

    if (viewState === TransactionSidesheetViews.loading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader variant={LoaderVariant.Default} />
            </div>
        );
    }

    if (viewState === TransactionSidesheetViews.cancel) {
        return (
            <SidesheetCancelPending
                amount={getTransactionAmount(transaction)}
                closeSidesheet={() => {
                    onTransactionSubmit && onTransactionSubmit();
                    handleOpen(false);
                }}
                exitTransaction={() =>
                    setViewState(TransactionSidesheetViews.default)
                }
                policyNumber={policy?.policyNumber}
                planCode={policy?.product?.planCode}
                transactionId={transaction?.transactionId}
                transactionType={transaction?.transactionType}
            />
        );
    }

    if (viewState === TransactionSidesheetViews.reverse) {
        return (
            <SidesheetReverseRecreate
                amount={getTransactionAmount(transaction)}
                effectiveDate={transaction.effectiveDate}
                exitTransaction={() =>
                    setViewState(TransactionSidesheetViews.default)
                }
                closeSidesheet={() => {
                    onTransactionSubmit && onTransactionSubmit();
                    handleOpen(false);
                }}
                policyNumber={policy?.policyNumber}
                planCode={policy?.product?.planCode}
                transactionType={transaction?.transactionType}
                reversalTransactionId={getReversalTransactionId(transaction)}
            />
        );
    }
    return (
        <div className={styles.keyValuesContainer}>
            <TransactionSidesheetActions transaction={transaction} />
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
