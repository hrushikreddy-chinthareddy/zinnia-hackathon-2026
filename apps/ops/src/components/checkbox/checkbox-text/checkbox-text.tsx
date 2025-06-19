import clsx from 'clsx';
import { HTMLAttributes } from 'react';

import AssistiveText, { AssistiveTextVariant } from '@deps/components/assistive-text/assistive-text';
import Content, { ContentVariant } from '@deps/components/content/content';

import Checkbox from '../checkbox';

export type CheckboxTextProps = {
    assistiveText?: {
        text: string;
        variant?: AssistiveTextVariant;
    };
    checked?: boolean;
    className?: string;
    isDisabled?: boolean;
    readonly?: boolean;
    isIndeterminate?: boolean;
    label: string;
    onChange?: (checked: boolean) => void;
    required?: boolean;
} & Omit<HTMLAttributes<HTMLInputElement>, 'onChange'>;

const CheckboxText = (props: CheckboxTextProps) => {
    const { assistiveText, isDisabled, readonly, label, className, ...restProps } = props;

    const labelClasses = clsx(
        'flex items-center space-x-2',
        {
            'cursor-not-allowed text-gray-900': isDisabled || readonly,
            'cursor-pointer': !isDisabled,
        },
        className
    );

    return (
        <div className="flex flex-col gap-6">
            <label className={labelClasses}>
                <Checkbox isDisabled={isDisabled} readonly={readonly} {...restProps} />
                <Content details={label} variant={ContentVariant.BodySm} contentClassName="items-center flex" />
            </label>
            {!!assistiveText?.text && <AssistiveText text={assistiveText.text} variant={assistiveText.variant} />}
        </div>
    );
};

export default CheckboxText;
