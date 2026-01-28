import {
    Button,
    FieldData,
    FieldSize as BloomFieldSize,
    FieldTypes,
    Icon,
    IconType,
    Label,
} from '@zinnia/bloom/components';
import { ChangeEvent, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useDebounce } from '@deps/hooks/useDebounce';
import { Expand, useTreeState } from '@deps/hooks/useTreeState';
import { FundAllocation, Fund } from '@zinnia/api-types/types/sor';

import {
    DataNodesRenderer,
    TreeDisplayMode,
} from '../components/data-node-renderer';
import {
    applyTransformationsToNodes,
    buildRenderTreeFromSourceData,
    transformNodes,
} from '../data-node-helpers/mutations';
import styles from '../find-all-key-values-sidesheet.module.css';
import { addToolTip, formatNode } from '../transformations/formatters';
import {
    excludeNodeByLabel,
    searchNodes,
} from '../transformations/node-visibility';
import { groupSingleFundDetails } from '../transformations/section-grouping';

/**
 * Props for the FundSidesheetContent component.
 */
interface FundSidesheetContentProps {
    /** The full allocation object from the policy */
    combinedFund: Fund | FundAllocation;
}

/**
 * Content component for the Fund Sidesheet.
 *
 * Renders fund data in a 3-level nested structure with search functionality.
 *
 * @param props - Component props
 * @returns The rendered content
 */
export const FundSidesheetContent = ({
    combinedFund,
}: FundSidesheetContentProps) => {
    const { treeState, setTreeState, searchValue, setSearchValue } =
        useTreeState();
    const { t } = useTranslation();
    const debouncedSearchValue = useDebounce(searchValue, 200);

    const fundNodes = useMemo(
        () =>
            applyTransformationsToNodes(
                // Build the fund node tree from the combined fund data
                (fund) => buildRenderTreeFromSourceData(fund, t),
                // Group into 3-level nested structure (Fund -> Segments -> Rates)
                (nodes) => groupSingleFundDetails({ nodes, t }),
                // Apply per-node transformations
                (nodes) =>
                    transformNodes({
                        nodes,
                        transforms: [
                            (node) =>
                                excludeNodeByLabel({
                                    node,
                                    useCase: 'funds',
                                }),
                            (node) => addToolTip({ node, t }),
                            (node) => formatNode({ node, t }),
                        ],
                    })
            )(combinedFund),
        [combinedFund, t]
    );

    const matches = useMemo(
        () => searchNodes(fundNodes, debouncedSearchValue),
        [fundNodes, debouncedSearchValue]
    );

    // Expand tree when search value changes
    useEffect(() => {
        if (!debouncedSearchValue) {
            return;
        }
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
                        {treeState === Expand
                            ? t('allFields.collapseAll')
                            : t('allFields.expandAll')}
                    </Button>
                </div>
                <DataNodesRenderer
                    nodes={matches}
                    mode={TreeDisplayMode.EXPAND_TOP}
                />
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
