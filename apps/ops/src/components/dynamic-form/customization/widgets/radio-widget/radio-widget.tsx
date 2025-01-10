import { FormContextType, RJSFSchema, StrictRJSFSchema, WidgetProps } from '@rjsf/utils';
import { Radio } from '@zinnia/bloom/components';

function RadioWidget<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>({
    options,
    value,
    disabled,
    onChange,
    id,
}: WidgetProps<T, S, F>) {
    const { enumOptions } = options;

    // const fetchData = async (search: { [key: string]: any }, nextPage: number) => {
    //     try {
    //         setLoading(true);
    //         const response = await axios.post(api({ page: nextPage, page_size: 3 }), search);
    //         const data: RadioOption[] = response.data.results.map((item: any) => ({
    //             label: item[labelKey],
    //             value: item[valueKey],
    //         }));
    //         setLoading(false);

    //         return data;
    //     } catch (error) {
    //         setLoading(false);
    //         console.error('Error fetching data:', error);
    //         return [];
    //     }
    // };

    // useEffect(() => {
    //     let default_data = [];

    //     const fetchDetails = async () => {
    //         if (props.formData) {
    //             const data = await fetchData(
    //                 {
    //                     [searchKey]: props.formData,
    //                 },
    //                 1
    //             );
    //             default_data = data;
    //         }
    //         const data = await fetchData({}, 1);
    //         setOptions([...data, ...default_data]);
    //     };

    //     fetchDetails();
    // }, []);

    const newOptions = Array.isArray(enumOptions)
        ? enumOptions.map(option => ({
              label: option.label,
              ariaLabel: option.label,
              value: option.value,
              subElement: '<span>Hello</span>',
          }))
        : [];

    return <Radio id={id} options={newOptions} isDisabled={disabled} defaultValue={value} onValueChange={onChange} />;
}

export default RadioWidget;
