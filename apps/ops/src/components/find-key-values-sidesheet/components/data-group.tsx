import { DataGroup } from '../types';
import { renderNode } from './data-node-renderer';
import styles from '../find-all-key-values-sidesheet.module.css';

export const Group = ({ children }: Omit<DataGroup, 'type'>) => {
    return (
        <div className={styles.subSectionContainer}>
            {children.map((node, index) => (
                <div
                    className={styles.subSectionStd}
                    key={`group-node-${index}`}
                >
                    {node.map((group, index) => (
                        <div key={`group-${index}`}>
                            {renderNode(group, index)}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};
