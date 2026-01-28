import { assertUnreachable } from '@deps/utils/assertions';

import { DataNode, FieldType } from '../types';
import { DataField } from './data-field';
import { Group } from './data-group';
import { Section } from './data-section';
import styles from '../find-all-key-values-sidesheet.module.css';

/**
 * Display mode for the tree structure.
 * - COLLAPSE_ALL: All sections collapsed (default)
 * - EXPAND_ALL: All sections expanded
 * - EXPAND_TOP: Only top-level sections expanded
 */
export enum TreeDisplayMode {
    COLLAPSE_ALL = 'COLLAPSE_ALL',
    EXPAND_ALL = 'EXPAND_ALL',
    EXPAND_TOP = 'EXPAND_TOP',
}

/**
 * Renders a single data node based on its type.
 *
 * @param node - The data node to render
 * @param index - Index for key generation
 * @param isTopLevel - Whether this node is at the top level (for EXPAND_TOP mode)
 * @param mode - Display mode for tree expansion
 */
export function renderNode(
    node: DataNode,
    index: number,
    isTopLevel: boolean = false,
    mode: TreeDisplayMode = TreeDisplayMode.COLLAPSE_ALL
): React.ReactNode {
    switch (node.type) {
        case FieldType.field: {
            return (
                <DataField
                    key={`${node.label}-${index}`}
                    dataField={[node.label, node.value]}
                    link={node.link}
                    toolTip={node.toolTip}
                    isPII={node.isPII}
                />
            );
        }

        case FieldType.section: {
            return (
                <Section
                    label={node.label}
                    tags={node.tags}
                    isPIILabel={node.isPIILabel}
                    isTopLevel={isTopLevel}
                    mode={mode}
                >
                    {node.children}
                </Section>
            );
        }
        case FieldType.group: {
            return <Group key={`group-${index}`}>{node.children}</Group>;
        }
        default:
            // Unit tests ensure this will never be called
            assertUnreachable(node);
    }
}

interface DataNodesRendererProps {
    nodes: DataNode[];
    /** Display mode for tree expansion. Defaults to COLLAPSE_ALL. */
    mode?: TreeDisplayMode;
}

/**
 * Renders a list of data nodes with configurable expansion mode.
 *
 * @param nodes - Array of data nodes to render
 * @param mode - Display mode (COLLAPSE_ALL, EXPAND_ALL, EXPAND_TOP)
 */
export const DataNodesRenderer = ({
    nodes,
    mode = TreeDisplayMode.COLLAPSE_ALL,
}: DataNodesRendererProps) => {
    return nodes.map((node, i) => (
        <div className={styles.keyValuesContainer} key={i}>
            {renderNode(node, i, true, mode)}
        </div>
    ));
};
