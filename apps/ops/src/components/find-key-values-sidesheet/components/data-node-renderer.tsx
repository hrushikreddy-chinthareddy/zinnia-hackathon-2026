import { DataNode, FieldType } from '../types';
import { DataField } from './data-field';
import { Group } from './data-group';
import { Section } from './data-section';
import styles from '../find-all-key-values-sidesheet.module.css';

export function renderNode(node: DataNode): React.ReactNode {
    switch (node.type) {
        case FieldType.field: {
            return (
                <DataField
                    dataField={[node.label, node.value]}
                    link={node.link}
                    toolTip={node.toolTip}
                    searchValue={''}
                />
            );
        }

        case FieldType.section: {
            return (
                <Section
                    label={node.label}
                    tags={node.tags}
                    children={node.children}
                />
            );
        }

        case FieldType.group: {
            return <Group children={node.children} />;
        }

        default:
            // Fully exhaustive since type is a Symbol
            return null;
    }
}

export const DataNodeRenderer = ({ nodes }: { nodes: DataNode[] }) => {
    return nodes.map((node, i) => (
        <div className={styles.container} key={i}>
            {renderNode(node)}
        </div>
    ));
};
