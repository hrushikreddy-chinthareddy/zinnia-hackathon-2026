import { Accordion } from '@xd/xd-components/src/components/Accordion/Accordion';
import { AccordionType } from '@xd/xd-components/src/components/Accordion/types';

import Highlighter from '@deps/components/highlighter/highlighter';

import { preparePolicy, prepareTransaction } from '../transformations';
import { ExpandCollapse, label, NestedData } from '../types';
import { KeyValueFieldList } from './key-value-field-list';

/**
 * A component that renders a list of key-value pairs based on the policyBasics
 * and searchValue.
 *
 * @param {ReturnType<typeof preparePolicy | typeof prepareTransaction>} preparedData - The details
 * @param {NestedData} policyBasics - The policy basics
 * @param {string} searchValue - The search value
 * @returns {JSX.Element} - A JSX element representing the key-value pairs
 */
export const KeyValueBasics = ({
    policyBasics,
    searchValue,
    treeState,
}: {
    preparedData: ReturnType<typeof preparePolicy | typeof prepareTransaction>;
    policyBasics: NestedData;
    searchValue: string;
    treeState: ExpandCollapse;
    type?: string;
}) => {
    if (policyBasics == null) {
        return null;
    }

    return (
        <Accordion
            sectionLabel={
                <Highlighter
                    text={policyBasics[label]}
                    highlights={[searchValue]}
                />
            }
            type={AccordionType.NESTED}
            treeState={treeState}
        >
            <KeyValueFieldList
                fields={policyBasics}
                searchValue={searchValue}
                treeState={treeState}
            />
        </Accordion>
    );
};
