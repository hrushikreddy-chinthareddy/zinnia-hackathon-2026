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
import { useEffect, useMemo, ChangeEvent, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import SidesheetCancelPending from '@deps/components/side-sheet/side-sheet-transaction/cancel-pending/side-sheet-cancel-pending';
import SidesheetReverseRecreate from '@deps/components/side-sheet/side-sheet-transaction/reverse-recreate/side-sheet-reverse-recreate';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { useViewState } from '@deps/contexts/ViewStateContext';
import { useDebounce } from '@deps/hooks/useDebounce';
import { Expand, useTreeState } from '@deps/hooks/useTreeState';
import { AccountingEntries, Transaction } from '@zinnia/api-types/types/sor';

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
    excludeNodeByLabel,
    searchNodes,
} from '../transformations/node-visibility';
import {
    groupTaxesSection,
    groupBasicsForTransaction,
    getAllParties,
    addAccountingEntriesGroup,
} from '../transformations/section-grouping';
import { getTransactionAmount, TransactionSidesheetViews } from '../utils';

export const TransactionSidesheetContent = ({
    accountingEntries,
    transaction,
    onTransactionSubmit,
}: {
    accountingEntries?: AccountingEntries[] | undefined;
    transaction: Transaction;
    onTransactionSubmit?: () => void;
}) => {
    const { treeState, setTreeState, searchValue, setSearchValue } =
        useTreeState();
    const { t } = useTranslation();

    const { policy, policyDetails } = useContext(PolicyData);

    const { viewState, setViewState } = useViewState();
    const { handleOpen } = useSideSheetContext();

    const debouncedSearchValue = useDebounce(searchValue, 200);

    // the map of partyId to party data is used to link party names within parties fields
    const allPartiesById = useMemo(() => {
        if (!policy || !policyDetails.planCode || !policyDetails.policyNumber) {
            return undefined;
        }
        const policyNodes = buildRenderTreeFromSourceData(policy, t);
        const { allPartiesById } = getAllParties({
            //FIXME: shoudln't run this often
            policyNodes,
            t,
            planCode: policyDetails.planCode,
            policyNumber: policyDetails.policyNumber,
        });
        return allPartiesById;
    }, [policy, t, policyDetails]);

    const transactionNodes = useMemo(() => {
        if (!allPartiesById) {
            return [];
        }

        const accountingEntriesNodes = buildRenderTreeFromSourceData(
            accountingEntries,
            t
        );

        // Chains transformations for the entire tree
        return applyTransformationsToNodes(
            // buildRenderTreeFromSourceData will take an arbitrary data structure, and
            // convert it into a structure that can be rendered
            // Full docs here: https://zinnia.atlassian.net/wiki/spaces/AU/pages/5738889232/Rendering+Data+Trees
            (nodes) => buildRenderTreeFromSourceData(nodes, t),
            groupBasicsForTransaction, // Groups all top-level DataField nodes into a section
            groupTaxesSection, // Combines various data into a Taxes section
            (nodes) => addAccountingEntriesGroup(nodes, accountingEntriesNodes),
            (nodes) =>
                // Transforms the entire tree, chaining transformations on *each node*
                transformNodes({
                    nodes,
                    transforms: [
                        (node) =>
                            // Excludes sections and fields that are required to be hidden
                            excludeNodeByLabel({
                                node,
                            }),
                        (node) =>
                            // Adds a link to any partyId fields
                            addLinkToPartyId({
                                node,
                                planCode: String(policyDetails.planCode),
                                policyNumber: String(
                                    policyDetails.policyNumber
                                ),
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
    }, [transaction, allPartiesById, policyDetails, accountingEntries, t]);

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
                transactionId={transaction.transactionId}
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
