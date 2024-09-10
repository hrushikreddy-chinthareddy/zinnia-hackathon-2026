import { Meta } from '@storybook/react';

import Title, { TitleVariant } from './title';

export default {
    title: 'Components/Title',
    component: Title,
    argTypes: {
        variant: {
            control: {
                type: 'select',
                options: Object.values(TitleVariant),
            },
        },
    },
    decorators: [
        Story => (
            <div className="container">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof Title>;

export const Subtitle = (args: any) => {
    return <Title {...args}>Default Title</Title>;
};

export const SubtitleAlt = (args: any) => {
    return (
        <Title variant={TitleVariant.SubTitleAlt} {...args}>
            Default Title
        </Title>
    );
};
