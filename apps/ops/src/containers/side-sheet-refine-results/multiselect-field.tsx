import { FieldSize } from '@deps/components/fields/field';
import { Loader } from '@deps/components/page-loader';
import { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import Select from '@deps/components/select/select';
import { toTitleCase } from '@deps/helpers/string.helper';

interface MultiselectFieldProps {
    isLoading: boolean;
    label: string;
    options: string[];
    value: Set<string>;
    handleChange: (value: string) => void;
}
export default function MultiselectField({ isLoading, label, options, value, handleChange }: MultiselectFieldProps) {
    const displayValues = {} as { [key: string]: string };
    Array.from(value).forEach(val => (displayValues[val] = toTitleCase(val)));

    return (
        <>
            {isLoading && (
                <div className="mb-4 mt-8">
                    <Loader variant={PageLoaderVariant.Center} />
                </div>
            )}
            {!isLoading && !!options.length && (
                <div className="mt-6">
                    <Select
                        isMultiselect
                        label={label}
                        options={options.sort().map((option: string) => ({
                            value: option,
                            label: toTitleCase(option),
                            displayText: toTitleCase(option),
                        }))}
                        value={displayValues}
                        onChange={handleChange}
                        size={FieldSize.Small}
                    />
                </div>
            )}
        </>
    );
}
