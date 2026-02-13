import { RetentionAttritionPieChart } from './chart/retention-attrition-pie-chart';
import { RetentionAttritionProvider } from './context/retention-attrition-provider';
import styles from './retention-attrition.module.css';
import { RetentionAttritionTable } from './table/retention-attrition-table';

export const RetentionAttrition = () => {
    return (
        <RetentionAttritionProvider>
            <div className={styles.retentionAttritionContainer}>
                <RetentionAttritionPieChart />
                <RetentionAttritionTable />
            </div>
        </RetentionAttritionProvider>
    );
};
