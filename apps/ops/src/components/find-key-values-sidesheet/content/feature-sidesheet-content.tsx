import {
    Button,
    FieldData,
    FieldTypes,
    Icon,
    IconType,
    Label,
    FieldSize as BloomFieldSize,
} from '@zinnia/bloom/components';
import { ChangeEvent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useDebounce } from '@deps/hooks/useDebounce';
import { Expand, useTreeState } from '@deps/hooks/useTreeState';

import { DataNodesRenderer } from '../components/data-node-renderer';
import {
    applyTransformationsToNodes,
    buildRenderTreeFromSourceData,
    transformNodes,
} from '../data-node-helpers/mutations';
import { isDataField } from '../data-node-helpers/predicates';
import styles from '../find-all-key-values-sidesheet.module.css';
import { addToolTip, formatNode } from '../transformations/formatters';
import {
    excludeNodeByLabel,
    searchNodes,
} from '../transformations/node-visibility';
import { FeatureSidesheetProps } from '../types';

export const FeatureSidesheetContent = ({
    policyDetails,
    feature,
}: FeatureSidesheetProps) => {
    const { treeState, setTreeState, searchValue, setSearchValue } =
        useTreeState();
    const { t } = useTranslation();
    const policyNomenclature = policyDetails.isLife
        ? t('policy.nomenclature.policy')
        : t('policy.nomenclature.contract');

    const debouncedSearchValue = useDebounce(searchValue, 200);

    const featureNodes = useMemo(
        () =>
            // Chains transformations for the entire tree
            applyTransformationsToNodes(
                // buildRenderTreeFromSourceData will take an arbitrary data structure, and
                // convert it into a structure that can be rendered
                // Full docs here: https://zinnia.atlassian.net/wiki/spaces/AU/pages/5738889232/Rendering+Data+Trees
                (nodes) => buildRenderTreeFromSourceData(nodes, t),
                (nodes) =>
                    // Transforms the entire tree, chaining transformations on *each node*
                    transformNodes({
                        nodes,
                        transforms: [
                            (node) =>
                                // Excludes sections and fields that are required to be hidden across all data
                                excludeNodeByLabel({
                                    node,
                                    useCase: 'features',
                                }),
                            (node) =>
                                // Adds a tooltip to the node if it exists in the tooltip mapping
                                addToolTip({
                                    node,
                                    t,
                                    policyNomenclature,
                                }),
                            (node) =>
                                // Applies translations and formats dates, currencies, etc.
                                formatNode({
                                    node,
                                    t,
                                    policyNomenclature,
                                }),
                        ],
                    })
            )(feature),
        [feature, t, policyNomenclature]
    );

    const matches = useMemo(
        () => searchNodes(featureNodes, debouncedSearchValue),
        [featureNodes, debouncedSearchValue]
    );

    const isFlat = useMemo(
        () => matches.every((node) => isDataField(node) || !node.children),
        [matches]
    );

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
                {!isFlat && (
                    <div className={styles.treeControl}>
                        <Button
                            mode="link"
                            size="small"
                            onClick={() =>
                                setTreeState((treeState) => !treeState)
                            }
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
                )}
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
