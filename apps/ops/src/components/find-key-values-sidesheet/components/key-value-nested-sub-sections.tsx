import { Accordion } from '@xd/xd-components/src/components/Accordion/Accordion';
import { AccordionType } from '@xd/xd-components/src/components/Accordion/types';

import Highlighter from '@deps/components/highlighter/highlighter';

import styles from '../find-all-key-values-sidesheet.module.css';
import {
    DataTuple,
    ExpandCollapse,
    label,
    link,
    MetaData,
    NestedData,
    tags,
} from '../types';
import { DataField } from './data-field';

/**
 * Renders a list of nested subsections.
 * Each subsection is rendered as a separate Accordion item.
 * The label of each subsection is highlighted if it matches the searchValue.
 * Each subsection contains a list of DataField components.
 *
 * @param subSections A list of nested subsections.
 * @param searchValue A string to highlight in the subsection labels.
 */

export const KeyValueNestedSubSections = ({
    subSections,
    searchValue,
    treeState,
}: {
    subSections: NestedData[];
    searchValue: string;
    treeState: ExpandCollapse;
}) => {
    return subSections.map((subSection, i) => {
        const subSectionLabel = (subSection as MetaData)[label];
        if (subSectionLabel == null) return null;

        const subSectionTags = (subSection as MetaData)[tags] as string[];

        return (
            <div
                key={`nested_subsection_${i}`}
                className={styles.subSectionBoxed}
            >
                <Accordion
                    key={String(subSectionLabel)}
                    sectionLabel={
                        <Highlighter
                            text={String(subSectionLabel)}
                            highlights={[searchValue]}
                        />
                    }
                    tags={subSectionTags}
                    type={AccordionType.NESTED}
                    treeState={treeState}
                >
                    <div className={styles.itemsList}>
                        {(subSection as NestedData[])
                            .map((field, j) => {
                                const [fieldLabel, data] = field as DataTuple;
                                const fieldLink = (field as MetaData)[link];
                                if (typeof fieldLabel === 'string') {
                                    return (
                                        <DataField
                                            key={`field_${j}`}
                                            dataField={[
                                                fieldLabel,
                                                String(data),
                                            ]}
                                            searchValue={searchValue}
                                            link={fieldLink}
                                        />
                                    );
                                } else if (field instanceof Array) {
                                    return (
                                        <KeyValueNestedSubSections
                                            key={`sub_subsection_`}
                                            subSections={
                                                [field] as NestedData[]
                                            }
                                            searchValue={searchValue}
                                            treeState={treeState}
                                        />
                                    );
                                }
                            })
                            .filter((field) => field !== null)}
                    </div>
                </Accordion>
            </div>
        );
    });
};
