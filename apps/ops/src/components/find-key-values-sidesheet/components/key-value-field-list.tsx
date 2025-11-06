import { ExpandCollapse, link, MetaData, NestedData, toolTip } from '../types';
import { DataField } from './data-field';
import { KeyValueNestedSubSections } from './key-value-nested-sub-sections';
import styles from '../find-all-key-values-sidesheet.module.css';

/**
 * Renders a list of fields from the given NestedDataTuple.
 * If the field data is an array, renders it as a nested subSection.
 * Otherwise, renders it as a DataField.
 * @param {NestedData} fields The NestedDataTuple of fields to render
 * @param {string} searchValue The search value to highlight in the field labels
 * @returns {JSX.Element} The rendered list of fields
 */
export const KeyValueFieldList = ({
    fields,
    searchValue,
    treeState,
}: {
    fields: NestedData;
    searchValue: string;
    treeState: ExpandCollapse;
}) => {
    return (
        <div className={styles.itemsList}>
            {fields
                // If the first element of the array is not a string, it will render
                // as subSection-in-subSection
                ?.filter((field) => {
                    const [key] = field as unknown[];
                    return typeof key === 'string';
                })
                .map((field, i) => {
                    const [key, data] = field as [string, unknown];

                    // Render key-value pairs as a DataField
                    return (
                        <DataField
                            key={`field_${i}`}
                            dataField={[key, String(data)]}
                            searchValue={searchValue}
                            link={(field as MetaData)?.[link]}
                            toolTip={(field as MetaData)?.[toolTip]}
                        />
                    );
                })}
            <KeyValueNestedSubSections
                key={`subsection_`}
                subSections={fields as NestedData[]}
                searchValue={searchValue}
                treeState={treeState}
            />
        </div>
    );
};
