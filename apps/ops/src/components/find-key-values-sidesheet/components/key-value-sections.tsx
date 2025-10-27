import { Accordion } from '@xd/xd-components/src/components/Accordion/Accordion';
import { AccordionType } from '@xd/xd-components/src/components/Accordion/types';

import Highlighter from '@deps/components/highlighter/highlighter';

import { preparePolicy, prepareTransaction } from '../transformations';
import { ExpandCollapse, Section } from '../types';
import { KeyValueFieldList } from './key-value-field-list';
import { KeyValueSubSections } from './key-value-sub-sections';

/**
 * Renders a list of data sections.
 * Each section is rendered as a separate Accordion item.
 * The label of each section is highlighted if it matches the searchValue.
 * Each section contains a list of DataField components and/or a list of subsections.
 * The subsections are rendered recursively using the KeyValueSubSections component.
 * @param {ReturnType<typeof preparePolicy | prepareTransaction>} preparedData
 * @param {Section[]} section
 * @param {string} searchValue
 * @returns {JSX.Element[]}
 */
export const KeyValueSections = ({
    preparedData,
    sections,
    searchValue,
    treeState,
}: {
    preparedData: ReturnType<typeof preparePolicy | typeof prepareTransaction>;
    sections: Section[];
    searchValue: string;
    treeState: ExpandCollapse;
}) => {
    return sections?.map((section, i) => {
        const [sectionLabel, sectionData] = section;
        const { fields, subSections } = sectionData;

        if (
            typeof sectionLabel !== 'string' ||
            (fields == null && subSections == null)
        ) {
            return null;
        }
        return (
            <Accordion
                key={`section_${i}`}
                sectionLabel={
                    <Highlighter
                        text={preparedData.formatAsSectionLabel(sectionLabel)}
                        highlights={[searchValue]}
                    />
                }
                type={AccordionType.NESTED}
                treeState={treeState}
            >
                {fields && (
                    <KeyValueFieldList
                        fields={fields}
                        searchValue={searchValue}
                        treeState={treeState}
                    />
                )}

                {subSections && (
                    <KeyValueSubSections
                        subSections={subSections}
                        searchValue={searchValue}
                        treeState={treeState}
                    />
                )}
            </Accordion>
        );
    });
};
