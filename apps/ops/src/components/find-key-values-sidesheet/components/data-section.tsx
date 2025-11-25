import { Accordion, AccordionType } from '@zinnia/bloom/components';

import Highlighter from '@deps/components/highlighter/highlighter';
import { useTreeState } from '@deps/hooks/useTreeState';

import { DataSection } from '../types';
import { renderNode } from './data-node-renderer';
import styles from '../find-all-key-values-sidesheet.module.css';

export const Section = ({
    label,
    tags,
    children,
}: Omit<DataSection, 'type'>) => {
    const { treeState, searchValue } = useTreeState();
    return (
        <div className={styles.subSection}>
            <Accordion
                key={`section_${label}`}
                sectionLabel={
                    <Highlighter text={label} highlights={[searchValue]} />
                }
                type={AccordionType.NESTED}
                treeState={treeState}
                tags={tags}
            >
                <div className={styles.itemsList}>
                    {children.map((node, index) => renderNode(node, index))}
                </div>
            </Accordion>
        </div>
    );
};
