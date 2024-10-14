import SelectSearchItem from '@deps/components/select-search/select-search-item/select-search-item';
import { DataDefinition } from '@deps/types/data';

interface SelectSearchGroupItemProps {
    icon?: JSX.Element;
    lastGroup?: boolean;
    headerText: string;
    groupArray: DataDefinition<any>[];
}

const SelectSearchGroupItem = ({ icon, lastGroup = false, headerText, groupArray }: SelectSearchGroupItemProps) => {
    const getBorderStyle = (lastGroup: boolean, lastChild: boolean) => {
        if (lastGroup && lastChild) {
            return 'border-none';
        } else if (lastChild) {
            return 'border-b-2 border-gray-900';
        } else {
            return 'border-b-2 border-gray-100';
        }
    };

    return (
        <div key={'grouped-value-' + headerText}>
            <div className={`bg-white px-4 pb-2 pt-2 ${icon ? 'flex gap-2' : 'flex'}`}>
                <div className={'flex self-center text-primary'}>{icon} </div>
                <p className={'self-center font-primary text-[12px] text-xs font-normal text-gray-900'}>{headerText}</p>
            </div>
            {groupArray.map(({ value, label }, vIndex) => (
                <SelectSearchItem
                    key={'select-search-item-' + label + vIndex}
                    fieldLabel={label}
                    data={value?.toString()}
                    className={getBorderStyle(lastGroup, vIndex === groupArray.length - 1)}
                />
            ))}
        </div>
    );
};

export default SelectSearchGroupItem;
