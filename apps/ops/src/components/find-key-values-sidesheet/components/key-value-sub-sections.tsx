import { Accordion } from '@xd/xd-components/src/components/Accordion/Accordion';
import { AccordionType } from '@xd/xd-components/src/components/Accordion/types';
import { Label } from '@zinnia/bloom/components';
import React from 'react';

import Highlighter from '@deps/components/highlighter/highlighter';

import { ExpandCollapse, MetaData, NestedData, tags } from '../types';
import { KeyValueFieldList } from './key-value-field-list';
import styles from '../find-all-key-values-sidesheet.module.css';

/**
 * Renders a list of subsections.
 * Each subsection is rendered as a separate Accordion item.
 * The label of each subsection is highlighted if it matches the searchValue.
 * Each subsection contains a list of DataField components.
 * @param {NestedData} subSections A list of subsections to render
 * @param {string} searchValue A string to highlight in the subsection labels
 * @returns {JSX.Element[]} The rendered list of subsections
 */
export const KeyValueSubSections = ({
    subSections,
    searchValue,
    treeState,
}: {
    subSections: NestedData;
    searchValue: string;
    treeState: ExpandCollapse;
}) => {
    return subSections?.map((subSection, i) => {
        const [subSectionLabel, subSectionFields] = subSection as [
            string,
            NestedData
        ];
        const subsectionTags = (subSection as MetaData)[tags];

        return (
            <React.Fragment key={`subsection_${i}`}>
                {subsectionTags?.length ? (
                    <div className={styles.subSectionTags}>
                        <Accordion
                            sectionLabel={
                                <Highlighter
                                    text={String(subSectionLabel)}
                                    highlights={[searchValue]}
                                />
                            }
                            tags={subsectionTags}
                            type={AccordionType.NESTED}
                            treeState={treeState}
                        >
                            <KeyValueFieldList
                                fields={subSectionFields}
                                searchValue={searchValue}
                                treeState={treeState}
                            />
                        </Accordion>
                    </div>
                ) : (
                    <div className={styles.subSectionStd}>
                        {subSectionLabel !== 'undefined' && (
                            <Label>
                                <Highlighter
                                    text={String(subSectionLabel)}
                                    highlights={[searchValue]}
                                />
                            </Label>
                        )}
                        <KeyValueFieldList
                            fields={subSectionFields}
                            searchValue={searchValue}
                            treeState={treeState}
                        />
                    </div>
                )}
            </React.Fragment>
        );
    });
};
