import { Accordion } from '@xd/xd-components/src/components/Accordion/Accordion';
import { AccordionType } from '@xd/xd-components/src/components/Accordion/types';

import Highlighter from '@deps/components/highlighter/highlighter';

import { DataSection, Expand } from '../types';
import { renderNode } from './data-node-renderer';
import styles from '../find-all-key-values-sidesheet.module.css';

export const Section = ({
    label,
    tags,
    children,
}: Omit<DataSection, 'type'>) => {
    //const treeState = useTreeState()
    return (
        <div className={styles.subSection}>
            <Accordion
                key={`section_${label}`}
                sectionLabel={<Highlighter text={label} highlights={['']} />}
                type={AccordionType.NESTED}
                treeState={Expand}
                tags={tags}
            >
                <div className={styles.itemsList}>
                    {children.map((node) => renderNode(node))}
                </div>
            </Accordion>
        </div>
    );
};
