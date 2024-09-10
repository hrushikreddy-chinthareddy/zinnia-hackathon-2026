import { Meta } from '@storybook/react';

import ClickWrapper from './click-wrapper';

export default {
    title: 'Components/ClickWrapper',
    component: ClickWrapper,
    decorators: [
        Story => (
            <div className="container">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof ClickWrapper>;

export const ClickWrapperComponent = () => {
    return (
        <ClickWrapper ariaLabel="Click Wrapper">
            <div className="p-5">Click Me</div>
        </ClickWrapper>
    );
};

export const ClickWrapperComponentDisabled = () => {
    return (
        <ClickWrapper isDisabled={true} ariaLabel="Click Wrapper">
            <div className="p-5">Click Me</div>
        </ClickWrapper>
    );
};
