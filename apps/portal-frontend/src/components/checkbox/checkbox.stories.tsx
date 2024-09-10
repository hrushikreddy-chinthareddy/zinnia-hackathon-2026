import { Meta } from '@storybook/react';

import Checkbox from './checkbox';
import CheckboxText from './checkbox-text/checkbox-text';

export default {
    title: 'Components/Checkbox',
    component: Checkbox,
    decorators: [
        Story => (
            <div>
                <Story />
            </div>
        ),
    ],
} as Meta<typeof Checkbox>;

export const CheckboxDefault = () => {
    const checkboxes = (
        <div className="flex flex-col space-y-2">
            <CheckboxText label="Default" />
            <CheckboxText label="Default Selected" checked={true} />
            <CheckboxText isDisabled={true} label="Disabled" />
            <CheckboxText isDisabled={true} checked={true} label="Disabled Selected" />
        </div>
    );

    return checkboxes;
};

export const CheckboxIndeterminate = () => {
    const checkboxes = (
        <div className="flex flex-col space-y-2">
            <CheckboxText isIndeterminate={true} label="Indeterminate Default" />
            <CheckboxText isIndeterminate={true} isDisabled={true} label="Indeterminate Disabled" />
        </div>
    );

    return checkboxes;
};
