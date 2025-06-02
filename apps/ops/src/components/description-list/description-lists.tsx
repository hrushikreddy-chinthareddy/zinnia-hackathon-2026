import { Policy } from '@zinnia/api-types/types/sor';

import { DataDefinition } from '@deps/types/data';

import DescriptionList from './description-list';

interface DescriptionListsProps<T extends object> {
    data: DataDefinition<T>[];
    labelClassName?: string;
    valueClassName?: string;
    gap?: string;
    highlighter?: string[];
    policy?: Policy;
    sideSheet?: boolean;
}

const DescriptionLists = <T extends object>({
    data,
    policy,
    labelClassName = '',
    valueClassName = '',
    highlighter = [],
    sideSheet = false,
}: DescriptionListsProps<T>) => {
    const columns = data.map(({ col = 1 }) => col);
    const uniqueColumns = columns.filter((n, i) => columns.indexOf(n) === i);

    return (
        <>
            {uniqueColumns.map((column, index) => (
                <div
                    className={`flex flex-col ${!sideSheet ? 'md:flex-row md:gap-8' : ''} lg:flex-col lg:justify-normal lg:gap-0`}
                    key={'description-lists-' + index}
                >
                    {data
                        .filter(({ col = 1 }) => column === col)
                        .map(({ label, value, tooltip, tooltipPlacement }: DataDefinition<T>) => (
                            <DescriptionList
                                key={'description-list-' + label}
                                highlights={highlighter}
                                label={label}
                                text={value as string}
                                tooltip={tooltip}
                                tooltipPlacement={tooltipPlacement}
                                labelClassName={labelClassName}
                                valueClassName={valueClassName}
                                policy={policy}
                            />
                        ))}
                </div>
            ))}
        </>
    );
};

export default DescriptionLists;
