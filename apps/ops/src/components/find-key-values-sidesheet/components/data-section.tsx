import { Accordion, AccordionType } from '@zinnia/bloom/components';

import Highlighter from '@deps/components/highlighter/highlighter';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { Expand, useTreeState } from '@deps/hooks/useTreeState';

import { DataSection } from '../types';
import { renderNode, TreeDisplayMode } from './data-node-renderer';
import styles from '../find-all-key-values-sidesheet.module.css';

interface SectionProps extends Omit<DataSection, 'type'> {
    /** Whether this section is at the top level of the tree */
    isTopLevel?: boolean;
    /** Display mode for tree expansion */
    mode?: TreeDisplayMode;
}

export const Section = ({
    label,
    tags,
    children,
    isPIILabel,
    isTopLevel = false,
    mode = TreeDisplayMode.COLLAPSE_ALL,
}: SectionProps) => {
    const { treeState, searchValue } = useTreeState();
    const labelEl = <Highlighter text={label} highlights={[searchValue]} />;

    // Determine effective tree state based on mode
    // - EXPAND_ALL: use global treeState (which should be Expand)
    // - COLLAPSE_ALL: use global treeState (which should be Collapse)
    // - EXPAND_TOP: expand only if this is a top-level section
    const effectiveTreeState =
        mode === TreeDisplayMode.EXPAND_TOP
            ? isTopLevel
                ? Expand
                : treeState
            : treeState;

    return (
        <div className={styles.subSection}>
            <Accordion
                key={`section_${label}`}
                sectionLabel={
                    isPIILabel ? <PiiWrapper>{labelEl}</PiiWrapper> : labelEl
                }
                type={AccordionType.NESTED}
                treeState={effectiveTreeState}
                tags={tags}
            >
                <div className={styles.itemsList}>
                    {children.map((node, index) =>
                        renderNode(node, index, false, mode)
                    )}
                </div>
            </Accordion>
        </div>
    );
};
