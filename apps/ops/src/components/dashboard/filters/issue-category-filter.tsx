import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { FC, useState } from 'react';

import { FieldSize } from '@deps/components/fields/field';
import Select from '@deps/components/select/select';
import { ZAHARA_DATE_FORMAT } from '@deps/helpers/date.helpers';
import { getExceptionCountQuery } from '@deps/queries/tanstack/dashboard/dashboardQueries';
import { ExceptionCountGroupByEnum } from '@zinnia/api-types/types/analytics';

import { IssueStatusType } from '../sections/issue-counts-by-status/context/issue-counts-by-status-context';

interface IssueCategoryFilterProps {
    className?: string;
    onChange: (value: string[]) => void;
}
export const IssueCategoryFilter: FC<IssueCategoryFilterProps> = ({
    className,
    onChange,
}) => {
    const [category, setCategory] = useState<IssueStatusType>({});

    // This function sets the category options which helps in displaying the selected options in the UI and passes the updated value to context that helps in query call
    const handleCategoryChange = (selected: string) => {
        setCategory((prev) => {
            // Create a new object based on the previous state
            const updated = { ...prev };
            // Toggle the selected category
            if (selected in updated) {
                delete updated[selected];
            } else {
                updated[selected] = selected;
            }
            // Notify parent component of changes
            onChange(Object.keys(updated));
            return updated;
        });
    };

    const startDate = dayjs().subtract(1, 'year').format(ZAHARA_DATE_FORMAT);
    const filter = {
        createdDateStart: startDate,
    };

    //This useQuery will fetch the category options from exeption-count and format the response into type MultiselectOption
    const { data: categoryFilterOptions } = useQuery({
        queryKey: ['issueCountsByStatusCategoryFilterOptions', filter],
        queryFn: async () => {
            const response = await getExceptionCountQuery(filter, [
                ExceptionCountGroupByEnum.EXCEPTION_CATEGORY,
            ]);
            return response;
        },
        placeholderData: (previousData) => previousData,
        select: (response) =>
            response?.data?.map((item) => ({
                label: item.name,
                value: item.name,
                displayText: item.name,
            })) ?? [],
    });

    return (
        <Select
            className={className}
            maxContentWidth
            label="Issue category"
            placeholder="All"
            options={categoryFilterOptions || []}
            size={FieldSize.XS}
            name="issue-category-dropdown-btn"
            value={category}
            isMultiselect
            onChange={(val) => handleCategoryChange(val)}
        />
    );
};
