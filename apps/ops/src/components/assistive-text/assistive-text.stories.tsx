import { Meta } from '@storybook/react';

import AssistiveText, {
    AssistiveTextProps,
    AssistiveTextVariant,
} from './assistive-text';
import '@deps/styles/styles.css';

export default {
    title: 'Components/AssistiveText',
    component: AssistiveText,
    decorators: [
        (Story) => (
            <div>
                <Story />
            </div>
        ),
    ],
    args: {
        text: 'Assistive Text',
        variant: AssistiveTextVariant.Default,
    },
} as Meta<typeof AssistiveText>;

export const Default = (args: AssistiveTextProps) => {
    return (
        <div className="flex flex-col gap-5">
            <AssistiveText {...args} variant={AssistiveTextVariant.Default}>
                {args.text}
            </AssistiveText>
            <AssistiveText {...args} variant={AssistiveTextVariant.Inactive}>
                {args.text}
            </AssistiveText>
            <AssistiveText {...args} variant={AssistiveTextVariant.Brand}>
                {args.text}
            </AssistiveText>
            <AssistiveText {...args} variant={AssistiveTextVariant.Success}>
                {args.text}
            </AssistiveText>
            <AssistiveText {...args} variant={AssistiveTextVariant.Info}>
                {args.text}
            </AssistiveText>
            <AssistiveText {...args} variant={AssistiveTextVariant.Warning}>
                {args.text}
            </AssistiveText>
            <AssistiveText {...args} variant={AssistiveTextVariant.Error}>
                {args.text}
            </AssistiveText>
        </div>
    );
};
