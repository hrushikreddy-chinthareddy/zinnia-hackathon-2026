import { groupValues, mapGroupToIcon } from '@deps/helpers/search.helpers';
import { DataDefinition } from '@deps/types/data';

import SelectSearchGroupItem from '../select-search-group-item/select-search-group-item';

interface SelectSearchGroupContainerProps {
    groupKey?: string;
    values: DataDefinition<any>[];
}

const SelectSearchGroupContainer = ({
    values,
    groupKey = 'group',
}: SelectSearchGroupContainerProps) => {
    const groupedData = groupValues(values, groupKey);

    return (
        <>
            {Object.keys(groupedData).map((key: string) => {
                const groupArray = groupedData[key] as DataDefinition<any>[];
                const header = groupArray[0].groupLabel || '';
                const Icon = mapGroupToIcon(key);

                return (
                    <SelectSearchGroupItem
                        key={'select-search-group-item-' + header}
                        headerText={header}
                        icon={<Icon width={16.5} height={16.5} />}
                        groupArray={groupArray}
                        lastGroup={
                            Object.keys(groupedData).indexOf(key) ===
                            Object.keys(groupedData).length - 1
                        }
                    />
                );
            })}
        </>
    );
};

export default SelectSearchGroupContainer;
