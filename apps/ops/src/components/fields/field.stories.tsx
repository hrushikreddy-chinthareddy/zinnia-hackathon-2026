import '@deps/styles/styles.css';
import { Meta } from '@storybook/react';
import { useState } from 'react';

import { ReactComponent as AlertExclamationIcon } from '@deps/styles/elements/icons/alert/alert-exclamation.svg';
import { ReactComponent as MailIcon } from '@deps/styles/elements/icons/icons_outlined/mail.svg';
import { ReactComponent as PhoneIcon } from '@deps/styles/elements/icons/icons_outlined/phone.svg';

import Field, { FieldSize, FieldType, FieldVariant } from './field';

export default {
    title: 'Components/Field',
    component: Field,
    decorators: [
        (Story) => (
            <div className="p-10">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof Field>;

export const Base = () => {
    const [value, setValue] = useState('');

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-row gap-5">
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Default"
                    endIcon={
                        <MailIcon
                            width={20}
                            height={20}
                            className="my-auto text-gray-900"
                        />
                    }
                    label="Label"
                    size={FieldSize.Default}
                    variant={FieldVariant.Default}
                    type={FieldType.Base}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Required"
                    endIcon={
                        <MailIcon
                            width={20}
                            height={20}
                            className="my-auto text-gray-900"
                        />
                    }
                    label="Label"
                    size={FieldSize.Default}
                    type={FieldType.Base}
                    required
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Default and Inactive"
                    endIcon={
                        <MailIcon width={20} height={20} className="my-auto" />
                    }
                    label="Label"
                    size={FieldSize.Default}
                    variant={FieldVariant.Inactive}
                    type={FieldType.Base}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Default and Success"
                    endIcon={
                        <MailIcon
                            width={20}
                            height={20}
                            className="my-auto text-gray-900"
                        />
                    }
                    label="Label"
                    size={FieldSize.Default}
                    variant={FieldVariant.Success}
                    type={FieldType.Base}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Default and Error"
                    endIcon={
                        <AlertExclamationIcon
                            width={20}
                            height={20}
                            className="my-auto"
                        />
                    }
                    label="Label"
                    message="Assistive message"
                    size={FieldSize.Default}
                    variant={FieldVariant.Error}
                    type={FieldType.Base}
                />
            </div>
            <div className="flex flex-row gap-5">
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Small and Default"
                    endIcon={
                        <MailIcon
                            width={20}
                            height={20}
                            className="my-auto text-gray-900"
                        />
                    }
                    label="Label"
                    size={FieldSize.Small}
                    variant={FieldVariant.Default}
                    type={FieldType.Base}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Required"
                    endIcon={
                        <MailIcon
                            width={20}
                            height={20}
                            className="my-auto text-gray-900"
                        />
                    }
                    label="Label"
                    size={FieldSize.Default}
                    type={FieldType.Base}
                    required
                />

                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Small and Inactive"
                    endIcon={
                        <MailIcon width={20} height={20} className="my-auto" />
                    }
                    label="Label"
                    size={FieldSize.Small}
                    variant={FieldVariant.Inactive}
                    type={FieldType.Base}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Small and Success"
                    endIcon={
                        <MailIcon
                            width={20}
                            height={20}
                            className="my-auto text-gray-900"
                        />
                    }
                    label="Label"
                    size={FieldSize.Small}
                    variant={FieldVariant.Success}
                    type={FieldType.Base}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Small and Error"
                    endIcon={
                        <AlertExclamationIcon
                            width={20}
                            height={20}
                            className="my-auto"
                        />
                    }
                    label="Label"
                    message="Assistive message"
                    size={FieldSize.Small}
                    variant={FieldVariant.Error}
                    type={FieldType.Base}
                />
            </div>
        </div>
    );
};

export const BaseActive = () => {
    const [value, setValue] = useState('');

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-row gap-5">
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Default"
                    endIcon={
                        <MailIcon width={20} height={20} className="my-auto" />
                    }
                    label="Label"
                    size={FieldSize.Default}
                    variant={FieldVariant.Default}
                    type={FieldType.BaseActive}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Default and Inactive"
                    endIcon={
                        <MailIcon width={20} height={20} className="my-auto" />
                    }
                    label="Label"
                    size={FieldSize.Default}
                    variant={FieldVariant.Inactive}
                    type={FieldType.BaseActive}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Default and Success"
                    endIcon={
                        <MailIcon width={20} height={20} className="my-auto" />
                    }
                    label="Label"
                    size={FieldSize.Default}
                    variant={FieldVariant.Success}
                    type={FieldType.BaseActive}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Default and Error"
                    endIcon={
                        <AlertExclamationIcon
                            width={20}
                            height={20}
                            className="my-auto"
                        />
                    }
                    label="Label"
                    message="Assistive message"
                    size={FieldSize.Default}
                    variant={FieldVariant.Error}
                    type={FieldType.BaseActive}
                />
            </div>
            <div className="flex flex-row gap-5">
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Small"
                    endIcon={
                        <MailIcon width={20} height={20} className="my-auto" />
                    }
                    label="Label"
                    size={FieldSize.Small}
                    variant={FieldVariant.Default}
                    type={FieldType.BaseActive}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Small and Inactive"
                    endIcon={
                        <MailIcon width={20} height={20} className="my-auto" />
                    }
                    label="Label"
                    size={FieldSize.Small}
                    variant={FieldVariant.Inactive}
                    type={FieldType.BaseActive}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Small and Success"
                    endIcon={
                        <MailIcon width={20} height={20} className="my-auto" />
                    }
                    label="Label"
                    size={FieldSize.Small}
                    variant={FieldVariant.Success}
                    type={FieldType.BaseActive}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Small and Error"
                    endIcon={
                        <AlertExclamationIcon
                            width={20}
                            height={20}
                            className="my-auto"
                        />
                    }
                    label="Label"
                    message="Assistive message"
                    size={FieldSize.Small}
                    variant={FieldVariant.Error}
                    type={FieldType.BaseActive}
                />
            </div>
        </div>
    );
};

export const Data = () => {
    const [value, setValue] = useState('');

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-row gap-5">
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Default"
                    label="Label"
                    labelTooltip="Label Tooltip"
                    size={FieldSize.Default}
                    variant={FieldVariant.Default}
                    type={FieldType.Base}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Default and Inactive"
                    label="Label"
                    labelTooltip="Label Tooltip"
                    size={FieldSize.Default}
                    variant={FieldVariant.Inactive}
                    type={FieldType.Base}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Default and Success"
                    label="Label"
                    labelTooltip="Label Tooltip"
                    size={FieldSize.Default}
                    variant={FieldVariant.Success}
                    type={FieldType.Base}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Default and Error"
                    label="Label"
                    labelTooltip="Label Tooltip"
                    message="Assistive message"
                    size={FieldSize.Default}
                    variant={FieldVariant.Error}
                    type={FieldType.Base}
                />
            </div>
            <div className="flex flex-row gap-5">
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Small and Default"
                    label="Label"
                    labelTooltip="Label Tooltip"
                    size={FieldSize.Small}
                    variant={FieldVariant.Default}
                    type={FieldType.Base}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Small and Inactive"
                    label="Label"
                    labelTooltip="Label Tooltip"
                    size={FieldSize.Small}
                    variant={FieldVariant.Inactive}
                    type={FieldType.Base}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Small and Success"
                    label="Label"
                    labelTooltip="Label Tooltip"
                    size={FieldSize.Small}
                    variant={FieldVariant.Success}
                    type={FieldType.Base}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Small and Error"
                    label="Label"
                    labelTooltip="Label Tooltip"
                    message="Assistive message"
                    size={FieldSize.Small}
                    variant={FieldVariant.Error}
                    type={FieldType.Base}
                />
            </div>
        </div>
    );
};

export const DataActive = () => {
    const [value, setValue] = useState('');

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-row gap-5">
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Default"
                    label="Label"
                    labelTooltip="Label Tooltip"
                    size={FieldSize.Default}
                    variant={FieldVariant.Default}
                    type={FieldType.BaseActive}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Default and Inactive"
                    label="Label"
                    labelTooltip="Label Tooltip"
                    size={FieldSize.Default}
                    variant={FieldVariant.Inactive}
                    type={FieldType.BaseActive}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Default and Success"
                    label="Label"
                    labelTooltip="Label Tooltip"
                    size={FieldSize.Default}
                    variant={FieldVariant.Success}
                    type={FieldType.BaseActive}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Default and Error"
                    label="Label"
                    labelTooltip="Label Tooltip"
                    message="Assistive message"
                    size={FieldSize.Default}
                    variant={FieldVariant.Error}
                    type={FieldType.BaseActive}
                />
            </div>
            <div className="flex flex-row gap-5">
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Small"
                    label="Label"
                    labelTooltip="Label Tooltip"
                    size={FieldSize.Small}
                    variant={FieldVariant.Default}
                    type={FieldType.BaseActive}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Small and Inactive"
                    label="Label"
                    labelTooltip="Label Tooltip"
                    size={FieldSize.Small}
                    variant={FieldVariant.Inactive}
                    type={FieldType.BaseActive}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Small and Success"
                    label="Label"
                    labelTooltip="Label Tooltip"
                    size={FieldSize.Small}
                    variant={FieldVariant.Success}
                    type={FieldType.BaseActive}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Small and Error"
                    label="Label"
                    labelTooltip="Label Tooltip"
                    message="Assistive message"
                    size={FieldSize.Small}
                    variant={FieldVariant.Error}
                    type={FieldType.BaseActive}
                />
            </div>
        </div>
    );
};

export const Masked = () => {
    const [value, setValue] = useState('');
    const format = '(###) ###-####';

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-row gap-5">
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    formatOptions={{ format }}
                    placeholder="(999) 999-9999"
                    endIcon={
                        <PhoneIcon
                            width={20}
                            height={20}
                            className="my-auto text-gray-900"
                        />
                    }
                    label="Default"
                    size={FieldSize.Default}
                    variant={FieldVariant.Default}
                    type={FieldType.Base}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    formatOptions={{ format }}
                    placeholder="(999) 999-9999"
                    label="Default and Inactive"
                    endIcon={
                        <PhoneIcon width={20} height={20} className="my-auto" />
                    }
                    size={FieldSize.Default}
                    variant={FieldVariant.Inactive}
                    type={FieldType.Base}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    formatOptions={{ format }}
                    placeholder="(999) 999-9999"
                    label="Default and Success"
                    endIcon={
                        <PhoneIcon
                            width={20}
                            height={20}
                            className="my-auto text-gray-900"
                        />
                    }
                    size={FieldSize.Default}
                    variant={FieldVariant.Success}
                    type={FieldType.Base}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    formatOptions={{ format }}
                    placeholder="(999) 999-9999"
                    label="Default and Error"
                    message="Assistive message"
                    endIcon={
                        <AlertExclamationIcon
                            width={20}
                            height={20}
                            className="my-auto"
                        />
                    }
                    size={FieldSize.Default}
                    variant={FieldVariant.Error}
                    type={FieldType.Base}
                />
            </div>
            <div className="flex flex-row gap-5">
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    formatOptions={{ format }}
                    placeholder="(999) 999-9999"
                    endIcon={
                        <PhoneIcon
                            width={20}
                            height={20}
                            className="my-auto text-gray-900"
                        />
                    }
                    label="Small"
                    size={FieldSize.Small}
                    variant={FieldVariant.Default}
                    type={FieldType.Base}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    formatOptions={{ format }}
                    placeholder="(999) 999-9999"
                    label="Small and Inactive"
                    endIcon={
                        <PhoneIcon width={20} height={20} className="my-auto" />
                    }
                    size={FieldSize.Small}
                    variant={FieldVariant.Inactive}
                    type={FieldType.Base}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    formatOptions={{ format }}
                    placeholder="(999) 999-9999"
                    label="Small and Success"
                    endIcon={
                        <PhoneIcon
                            width={20}
                            height={20}
                            className="my-auto text-gray-900"
                        />
                    }
                    size={FieldSize.Small}
                    variant={FieldVariant.Success}
                    type={FieldType.Base}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    formatOptions={{ format }}
                    placeholder="(999) 999-9999"
                    label="Small and Error"
                    message="Assistive message"
                    endIcon={
                        <AlertExclamationIcon
                            width={20}
                            height={20}
                            className="my-auto"
                        />
                    }
                    size={FieldSize.Small}
                    variant={FieldVariant.Error}
                    type={FieldType.Base}
                />
            </div>
        </div>
    );
};

export const MaskedActive = () => {
    const [value, setValue] = useState('');
    const format = '(###) ###-####';

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-row gap-5">
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    formatOptions={{ format }}
                    placeholder="(999) 999-9999"
                    endIcon={
                        <PhoneIcon
                            width={20}
                            height={20}
                            className="my-auto text-gray-900"
                        />
                    }
                    label="Default"
                    size={FieldSize.Default}
                    variant={FieldVariant.Default}
                    type={FieldType.BaseActive}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    formatOptions={{ format }}
                    placeholder="(999) 999-9999"
                    label="Default and Inactive"
                    endIcon={
                        <PhoneIcon width={20} height={20} className="my-auto" />
                    }
                    size={FieldSize.Default}
                    variant={FieldVariant.Inactive}
                    type={FieldType.BaseActive}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    formatOptions={{ format }}
                    placeholder="(999) 999-9999"
                    label="Default and Success"
                    endIcon={
                        <PhoneIcon
                            width={20}
                            height={20}
                            className="my-auto text-gray-900"
                        />
                    }
                    size={FieldSize.Default}
                    variant={FieldVariant.Success}
                    type={FieldType.BaseActive}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    formatOptions={{ format }}
                    placeholder="(999) 999-9999"
                    label="Default and Error"
                    message="Assistive message"
                    endIcon={
                        <AlertExclamationIcon
                            width={20}
                            height={20}
                            className="my-auto"
                        />
                    }
                    size={FieldSize.Default}
                    variant={FieldVariant.Error}
                    type={FieldType.BaseActive}
                />
            </div>
            <div className="flex flex-row gap-5">
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    formatOptions={{ format }}
                    placeholder="(999) 999-9999"
                    endIcon={
                        <PhoneIcon
                            width={20}
                            height={20}
                            className="my-auto text-gray-900"
                        />
                    }
                    label="Small"
                    size={FieldSize.Small}
                    variant={FieldVariant.Default}
                    type={FieldType.BaseActive}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    formatOptions={{ format }}
                    placeholder="(999) 999-9999"
                    label="Small and Inactive"
                    endIcon={
                        <PhoneIcon width={20} height={20} className="my-auto" />
                    }
                    size={FieldSize.Small}
                    variant={FieldVariant.Inactive}
                    type={FieldType.BaseActive}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    formatOptions={{ format }}
                    placeholder="(999) 999-9999"
                    label="Small and Success"
                    endIcon={
                        <PhoneIcon
                            width={20}
                            height={20}
                            className="my-auto text-gray-900"
                        />
                    }
                    size={FieldSize.Small}
                    variant={FieldVariant.Success}
                    type={FieldType.BaseActive}
                />
                <Field
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    formatOptions={{ format }}
                    placeholder="(999) 999-9999"
                    label="Small and Error"
                    message="Assistive message"
                    endIcon={
                        <AlertExclamationIcon
                            width={20}
                            height={20}
                            className="my-auto"
                        />
                    }
                    size={FieldSize.Small}
                    variant={FieldVariant.Error}
                    type={FieldType.BaseActive}
                />
            </div>
        </div>
    );
};
