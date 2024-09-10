import { Meta } from '@storybook/react';

import ButtonGroupItem from './button-group-item';
import '@deps/styles/styles.css';

export default {
    title: 'Components/ButtonGroup/ButtonGroupItem',
    component: ButtonGroupItem,
    decorators: [
        Story => (
            <div>
                <Story />
            </div>
        ),
    ],
} as Meta<typeof ButtonGroupItem>;

const onClick = () => {
    alert('Button clicked');
};

export const FirstButtonGroupItem = () => {
    return (
        <>
            <ButtonGroupItem
                checked={false}
                disabled={false}
                label="First"
                onClick={onClick}
                className="relative box-border h-[42px] flex-grow justify-center font-secondary text-md leading-5.5"
                position="first"
            />
        </>
    );
};

export const MiddleButtonGroupItem = () => {
    return (
        <>
            <ButtonGroupItem
                checked={false}
                disabled={false}
                label="Middle"
                onClick={onClick}
                className="relative box-border h-[42px] flex-grow justify-center font-secondary text-md leading-5.5"
                position="middle"
            />
        </>
    );
};

export const EndButtonGroupItem = () => {
    return (
        <>
            <ButtonGroupItem
                checked={false}
                disabled={false}
                label="End"
                onClick={onClick}
                className="relative box-border h-[42px] flex-grow justify-center font-secondary text-md leading-5.5"
                position="end"
            />
        </>
    );
};
