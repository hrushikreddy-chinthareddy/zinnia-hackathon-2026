import { FieldDataProps, FieldData } from '@zinnia/bloom/components';
import { ChangeEventHandler, useState, useEffect } from 'react';

type StatefulFieldDataProps = Omit<FieldDataProps, 'onChange' | 'onBlur'> & {
    onChange: (value: any) => void;
};

export function StatefulFieldData(props: StatefulFieldDataProps) {
    const { onChange: callerOnChange, ...restProps } = props;
    const [value, setValue] = useState<any>(props.value);

    // Sync local state with Caller's value when it changes
    useEffect(() => {
        setValue(props.value);
    }, [props.value]);

    const onBlur = (): void => {
        callerOnChange(value);
    };

    const onChange: ChangeEventHandler<any> = (e): void => {
        setValue(e.target.value);
    };

    return (
        <FieldData
            {...restProps}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
        />
    );
}
