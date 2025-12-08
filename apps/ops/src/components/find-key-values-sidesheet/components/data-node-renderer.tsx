import { DataNode, FieldType } from '../types';
import { DataField } from './data-field';
import { Group } from './data-group';
import { Section } from './data-section';
import styles from '../find-all-key-values-sidesheet.module.css';

export function renderNode(node: DataNode, index: number): React.ReactNode {
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
                >
                    {node.children}
                </Section>
            );
        }
        case FieldType.group: {
            return <Group key={`group-${index}`}>{node.children}</Group>;
        }
        default:
            // Fully exhaustive since type is a Symbol
            return null;
    }
}

export const DataNodesRenderer = ({ nodes }: { nodes: DataNode[] }) => {
    return nodes.map((node, i) => (
        <div className={styles.keyValuesContainer} key={i}>
            {renderNode(node, i)}
        </div>
    ));
};
