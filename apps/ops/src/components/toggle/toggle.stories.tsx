import '@deps/styles/styles.css';
import { Meta } from '@storybook/react';
import { useState } from 'react';

import Toggle, { ToggleSize, ToggleVariant } from './toggle';

export default {
    title: 'Components/Toggle',
    component: Toggle,
    decorators: [
        (Story) => (
            <div className="container">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof Toggle>;

export const ToggleComponent = () => {
    const [value, setValue] = useState(false);

    return (
        <div className="flex flex-col gap-5">
            <Toggle value={value} handleToggle={setValue} label="Default" />
            <Toggle
                value={value}
                handleToggle={setValue}
                label="Large"
                size={ToggleSize.Large}
            />
            <Toggle
                value={value}
                handleToggle={setValue}
                label="With Text"
                text="Text"
            />
            <Toggle
                value={value}
                handleToggle={setValue}
                label="Inactive"
                variant={ToggleVariant.Inactive}
            />
        </div>
    );
};
