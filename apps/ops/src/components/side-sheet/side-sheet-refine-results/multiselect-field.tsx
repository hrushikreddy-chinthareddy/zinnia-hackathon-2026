import { FieldSize } from '@deps/components/fields/field';
import { Loader } from '@deps/components/page-loader';
import { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import Select from '@deps/components/select/select';
import { toTitleCase } from '@deps/helpers/string.helpers';

interface MultiselectFieldProps {
    isLoading: boolean;
    label: string;
    options: string[];
    disabled?: boolean;
    value: Set<string>;
    customLabelMap?: Record<string, string>;
    handleChange: (value: string) => void;
}

export default function MultiselectField({
    isLoading,
    label,
    options,
    value,
    disabled,
    customLabelMap,
    handleChange,
}: MultiselectFieldProps) {
    const formatLabel = (val: string): string => {
        if (customLabelMap?.[val]) return customLabelMap[val];
        return val.includes('_')
            ? val
                  .split('_')
                  .map((word) => toTitleCase(word[0] + word.slice(1)))
                  .join(' ')
            : toTitleCase(val);
    };

    const displayValues = Object.fromEntries(
        Array.from(value).map((val) => [
            val,
            customLabelMap?.[val] ?? formatLabel(val),
        ])
    );

    const formattedOptions = options.sort().map((option) => {
        const label = customLabelMap?.[option] ?? formatLabel(option);
        return {
            value: option,
            label,
            displayText: label,
        };
    });

    return (
        <>
            {isLoading ? (
                <div className="mb-4 mt-8">
                    <Loader variant={PageLoaderVariant.Center} />
                </div>
            ) : (
                !!options.length && (
                    <div className="mt-6">
                        <Select
                            isMultiselect
                            label={label}
                            options={formattedOptions}
                            value={displayValues}
                            onChange={handleChange}
                            size={FieldSize.Small}
                            placeholder="Select"
                            disabled={disabled}
                        />
                    </div>
                )
            )}
        </>
    );
}
